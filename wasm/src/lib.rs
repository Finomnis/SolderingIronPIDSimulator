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

    while simulation.get_time() < 500.0 {
        let heater_duty = controller.update(simulation.get_temperature());
        simulation.set_heater_duty(heater_duty);
        simulation.update();
    }

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
