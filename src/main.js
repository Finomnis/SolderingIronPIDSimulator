import _ from "lodash";
import { Simulation } from "./simulation";
import { SimpleController } from "./controllers/simple";
import { createCharts } from "./charts";
import { createInputs } from "./inputs";

let { tempChart, dutyChart } = createCharts();

let simulation_parameters = {
    heater_max_power: 100.0,
    thermal_mass_heater: 5.0,
    thermal_mass_tip: 5.0,
    thermal_coupling_heater: 0.3,
    thermal_coupling_air: 0.1,
    thermal_mass_solder: 5.0,
    thermal_coupling_solder: 1.0,
    thermal_coupling_solder_air: 0.05,
    time_step: 0.1,
    time_step_charts: 1.0,
    air_temp: 25.0,
};

let wasm = null;

function run_simulation_js(simulation_parameters) {
    let simulation = new Simulation(simulation_parameters);

    const controller = new SimpleController(400);

    const next_step = () => {
        const new_duty = controller.update({
            time: simulation.get_current_time(),
            temperature: simulation.get_current_temp(),
        });

        simulation.set_heater_duty(Math.min(1.0, Math.max(0.0, new_duty)));
        simulation.update();
    };

    while (simulation.time < 100) next_step();
    while (simulation.time < 300) next_step();
    simulation.set_touches_solder(true);
    while (simulation.time < 400) next_step();
    simulation.set_touches_solder(false);
    while (simulation.time < 499) next_step();

    return simulation;
}

function run_simulation_rs(simulation_parameters) {
    if (wasm === null) {
        console.log("Warning: wasm not loaded yet.");
        return;
    }

    const t0 = performance.now();
    const result_str = wasm.run_simulation(simulation_parameters);

    const t1 = performance.now();
    const json_vals = JSON.parse(result_str);

    const convert_to_xy = (timestamps, data) =>
        _.zip(timestamps, data).map(([t, v]) => ({ x: t, y: v }));

    const result = {
        chart_temp_heater: convert_to_xy(
            json_vals.time,
            json_vals.chart_temp_heater
        ),
        chart_temp_tip: convert_to_xy(json_vals.time, json_vals.chart_temp_tip),
        chart_temp_solder: convert_to_xy(
            json_vals.time,
            json_vals.chart_temp_solder
        ),
        chart_heater_duty: convert_to_xy(
            json_vals.time,
            json_vals.chart_heater_duty
        ),
        chart_touches_solder: convert_to_xy(
            json_vals.time,
            json_vals.chart_touches_solder
        ),
    };
    const t2 = performance.now();

    console.log("Computation: " + (t1 - t0) + " ms");
    console.log("Postprocessing: " + (t2 - t1) + " ms");

    return result;
}

function update_simulation() {
    const t0 = performance.now();
    const simulation = run_simulation_rs(simulation_parameters);
    const t1 = performance.now();
    console.log("Total update: " + (t1 - t0) + " ms");

    tempChart.data.datasets[0].data = simulation.chart_temp_heater;
    tempChart.data.datasets[1].data = simulation.chart_temp_tip;
    tempChart.data.datasets[2].data = simulation.chart_temp_solder;
    dutyChart.data.datasets[0].data = simulation.chart_touches_solder;
    dutyChart.data.datasets[1].data = simulation.chart_heater_duty;
    tempChart.update();
    dutyChart.update();
}

export function main(wasm_) {
    wasm = wasm_;
    createInputs(update_simulation, simulation_parameters);
    update_simulation();
}
