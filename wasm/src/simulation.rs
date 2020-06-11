use js_sys::{Object, Reflect};
use wasm_bindgen::prelude::*;

use crate::simulation_state::SimulationState;
use crate::solvers;

pub struct Simulation {
    // Stepping size
    time_step: f32,
    time_step_charts: f32,

    // Simulated values
    air_temp: f32,
    simulation_state: SimulationState,
    time: f32,

    // Constants
    heater_max_power: f32,            // W, J/s, Joule per second
    thermal_mass_heater: f32,         // J/K, how much joule necessary to heat up by one kelvin
    thermal_mass_tip: f32,            // J/K, how much joule necessary to heat up by one kelvin
    thermal_mass_solder: f32,         // J/K, how much joule necessary to heat up by one kelvin
    thermal_coupling_heater: f32,     // W/K, how much watt get transfered per kelvin difference
    thermal_coupling_air: f32, // W/K, how much heat gets dissipated per kelvin difference to ambient
    thermal_coupling_solder: f32, // W/K, how much heat flows into the solder
    thermal_coupling_solder_air: f32, // W/K, how much heat flows into the solder

    // Modulatable values
    heater_duty: f32,
    touches_solder: bool,

    // Charts
    time_chart_next: f32,
    pub chart_time: Vec<u32>,
    pub chart_temp_heater: Vec<f32>,
    pub chart_temp_tip: Vec<f32>,
    pub chart_temp_solder: Vec<f32>,
    pub chart_heater_duty: Vec<f32>,
    pub chart_touches_solder: Vec<u32>,
}

fn get_f32(obj: &Object, key: &str) -> Result<f32, JsValue> {
    let js_val = Reflect::get(&obj, &JsValue::from(key))?;
    let f64_val = js_val
        .as_f64()
        .ok_or(JsValue::from(format!("'{}': Expected float value!", key)))?;

    Ok(f64_val as f32)
}

impl Simulation {
    pub fn new(params: Object) -> Result<Simulation, JsValue> {
        let air_temp = get_f32(&params, "air_temp")?;

        let mut result = Simulation {
            // Stepping size
            time_step: get_f32(&params, "time_step")?,
            time_step_charts: get_f32(&params, "time_step_charts")?,

            // Simulated values
            air_temp: air_temp,
            simulation_state: SimulationState {
                temp_heater: air_temp,
                temp_tip: air_temp,
                temp_solder: air_temp,
            },
            time: 0.0,

            // Constants
            heater_max_power: get_f32(&params, "heater_max_power")?, // W, J/s, Joule per second
            thermal_mass_heater: get_f32(&params, "thermal_mass_heater")?, // J/K, how much joule necessary to heat up by one kelvin
            thermal_mass_tip: get_f32(&params, "thermal_mass_tip")?, // J/K, how much joule necessary to heat up by one kelvin
            thermal_mass_solder: get_f32(&params, "thermal_mass_solder")?, // J/K, how much joule necessary to heat up by one kelvin
            thermal_coupling_heater: get_f32(&params, "thermal_coupling_heater")?, // W/K, how much watt get transfered per kelvin difference
            thermal_coupling_air: get_f32(&params, "thermal_coupling_air")?, // W/K, how much heat gets dissipated per kelvin difference to ambient
            thermal_coupling_solder: get_f32(&params, "thermal_coupling_solder")?, // W/K, how much heat flows into the solder
            thermal_coupling_solder_air: get_f32(&params, "thermal_coupling_solder_air")?, // W/K, how much heat flows into the solder

            // Modulatable values
            heater_duty: 1.0,
            touches_solder: false,

            // Charts
            time_chart_next: 0.0,
            chart_time: vec![],
            chart_temp_heater: vec![],
            chart_temp_tip: vec![],
            chart_temp_solder: vec![],
            chart_heater_duty: vec![],
            chart_touches_solder: vec![],
        };

        result.update_charts();

        Ok(result)
    }

    fn update_charts(&mut self) {
        if self.time >= self.time_chart_next {
            self.chart_time.push(self.time as u32);
            self.chart_temp_heater
                .push(self.simulation_state.temp_heater);
            self.chart_temp_tip.push(self.simulation_state.temp_tip);
            self.chart_temp_solder
                .push(self.simulation_state.temp_solder);
            self.chart_heater_duty.push(self.heater_duty);
            self.chart_touches_solder
                .push(if self.touches_solder { 1 } else { 0 });

            self.time_chart_next += self.time_step_charts;
        }
    }

    pub fn update(&mut self) {
        self.update_temperatures();

        self.time += self.time_step;
        self.update_charts();
    }

    pub fn get_time(&self) -> f32 {
        self.time
    }
    pub fn get_temperature(&self) -> f32 {
        self.simulation_state.temp_tip
    }
    pub fn set_heater_duty(&mut self, duty: f32) {
        self.heater_duty = duty;
    }

    fn update_temperatures(&mut self) {
        let f = |SimulationState {
                     temp_heater,
                     temp_tip,
                     temp_solder,
                 }| {
            let heater_power = self.heater_max_power * self.heater_duty;

            let power_transferred_heater_tip =
                (temp_heater - temp_tip) * self.thermal_coupling_heater;

            let power_transferred_tip_air = (temp_tip - self.air_temp) * self.thermal_coupling_air;

            let power_transferred_tip_solder = if self.touches_solder {
                (temp_tip - temp_solder) * self.thermal_coupling_solder
            } else {
                0.0
            };

            let power_transferred_solder_air =
                (temp_solder - self.air_temp) * self.thermal_coupling_solder_air;

            let deriv_temp_heater =
                (heater_power - power_transferred_heater_tip) / self.thermal_mass_heater;

            let deriv_temp_tip = (power_transferred_heater_tip
                - power_transferred_tip_air
                - power_transferred_tip_solder)
                / self.thermal_mass_tip;

            let deriv_temp_solder = (power_transferred_tip_solder - power_transferred_solder_air)
                / self.thermal_mass_solder;

            SimulationState {
                temp_heater: deriv_temp_heater,
                temp_tip: deriv_temp_tip,
                temp_solder: deriv_temp_solder,
            }
        };

        self.simulation_state = solvers::runge_kutta_3_8(self.time_step, f, self.simulation_state);
    }
}
