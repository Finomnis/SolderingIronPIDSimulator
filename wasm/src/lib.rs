use wasm_bindgen::prelude::*;

use js_sys::{Object, Reflect};

mod logger;
mod simulation;

use simulation::Simulation;

#[wasm_bindgen]
pub fn run_simulation(simulation_parameters: Object) -> Result<Object, JsValue> {
    let mut simulation = Simulation::new(simulation_parameters)?;

    while simulation.get_time() < 500.0 {
        simulation.update()?;
    }

    let result = Object::new();

    Reflect::set(
        &result,
        &"chart_temp_heater".into(),
        &simulation.chart_temp_heater,
    )?;
    Reflect::set(
        &result,
        &"chart_temp_tip".into(),
        &simulation.chart_temp_tip,
    )?;
    Reflect::set(
        &result,
        &"chart_temp_solder".into(),
        &simulation.chart_temp_solder,
    )?;
    Reflect::set(
        &result,
        &"chart_touches_solder".into(),
        &simulation.chart_touches_solder,
    )?;
    Reflect::set(
        &result,
        &"chart_heater_duty".into(),
        &simulation.chart_heater_duty,
    )?;

    Ok(result)
}
