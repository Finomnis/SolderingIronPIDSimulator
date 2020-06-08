import Chart from "chart.js";
import { Simulation } from "./simulation";

let simulation = new Simulation({
    heater_max_power: 100.0,
    thermal_mass_heater: 5.0,
    thermal_mass_tip: 5.0,
    thermal_coupling_heater: 0.5,
    thermal_coupling_air: 0.1,
    thermal_mass_solder: 5.0,
    thermal_coupling_solder: 1.0,
    thermal_coupling_solder_air: 0.05,
});

let tempChart = new Chart(
    document.getElementById("tempChart").getContext("2d"),
    {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Heater",
                    data: simulation.chart_temp_heater,
                    borderColor: "red",
                    pointRadius: 0,
                },
                {
                    label: "Tip",
                    data: simulation.chart_temp_tip,
                    borderColor: "blue",
                    pointRadius: 0,
                },
                {
                    label: "Solder",
                    data: simulation.chart_temp_solder,
                    borderColor: "green",
                    pointRadius: 0,
                },
            ],
        },
        options: {
            animation: {
                duration: 0, // general animation time
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            callback: function (value, index, values) {
                                return value + " °C";
                            },
                        },
                    },
                ],
                xAxes: [
                    {
                        type: "linear",
                        ticks: {
                            beginAtZero: true,
                            callback: function (value, index, values) {
                                return value + " s";
                            },
                        },
                    },
                ],
            },
        },
    }
);

let dutyChart = new Chart(
    document.getElementById("dutyChart").getContext("2d"),
    {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Touches Solder",
                    data: simulation.chart_touches_solder,
                    borderColor: "green",
                    pointRadius: 0,
                },
                {
                    label: "Heater Duty",
                    data: simulation.chart_heater_duty,
                    borderColor: "red",
                    pointRadius: 0,
                },
            ],
        },
        options: {
            animation: {
                duration: 0, // general animation time
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
                xAxes: [
                    {
                        type: "linear",
                        ticks: {
                            beginAtZero: true,
                            callback: function (value, index, values) {
                                return value + " s";
                            },
                        },
                    },
                ],
            },
        },
    }
);

/*
function nextStep() {
    simulation.update();
    tempChart.update();

    setTimeout(nextStep, 10);
}
nextStep();
*/

const next_step = () => {
    if (simulation.get_current_temp() > 400) {
        simulation.set_heater_duty(0.0);
    } else {
        simulation.set_heater_duty(1.0);
    }
    simulation.update();
};

while (simulation.time < 100) next_step();
while (simulation.time < 300) next_step();
simulation.set_touches_solder(true);
while (simulation.time < 400) next_step();
simulation.set_touches_solder(false);
while (simulation.time < 499) next_step();

tempChart.update();
dutyChart.update();
