use serde_json::json;
use wasm_bindgen::prelude::*;

use js_sys::Object;

mod logger;
mod simulation;

use simulation::Simulation;

#[wasm_bindgen]
pub fn run_simulation(simulation_parameters: Object) -> Result<String, JsValue> {
    let mut simulation = Simulation::new(simulation_parameters)?;

    while simulation.get_time() < 500.0 {
        simulation.update()?;
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
