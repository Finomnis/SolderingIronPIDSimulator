use serde_json::json;
use wasm_bindgen::prelude::*;

use js_sys::Object;

mod controllers;
mod logger;
mod simulation;
mod simulation_state;
mod solvers;

use controllers::Controller;
use controllers::SimpleController;
use simulation::Simulation;

#[wasm_bindgen]
pub fn run_simulation(simulation_parameters: Object) -> Result<String, JsValue> {
    let mut simulation = Simulation::new(simulation_parameters)?;

    let mut controller = SimpleController::new();
    controller.set_target_temperature(400.0);

    let mut next_step = |max_time: f32, simulation: &mut Simulation| -> bool {
        let heater_duty = controller.update(simulation.get_temperature());
        simulation.set_heater_duty(heater_duty);
        simulation.update();
        simulation.get_time() + simulation.get_time_step() < max_time
    };

    while next_step(100.0, &mut simulation) {}

    while next_step(300.0, &mut simulation) {}

    simulation.set_touches_solder(true);
    while next_step(400.0, &mut simulation) {}

    simulation.set_touches_solder(false);
    while next_step(500.0, &mut simulation) {}

    let result = json!({
        "time": simulation.chart_time,
        "chart_temp_heater": simulation.chart_temp_heater,
        "chart_temp_tip": simulation.chart_temp_tip,
        "chart_temp_solder": simulation.chart_temp_solder,
        "chart_touches_solder": simulation.chart_touches_solder,
        "chart_heater_duty": simulation.chart_heater_duty,
    });

    Ok(result.to_string())
}
