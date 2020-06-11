use std::ops::{Add, Mul};

#[derive(Debug, Copy, Clone)]
pub struct SimulationState {
    pub temp_heater: f32,
    pub temp_tip: f32,
    pub temp_solder: f32,
}

impl Add for &SimulationState {
    type Output = SimulationState;

    fn add(self, other: &SimulationState) -> SimulationState {
        SimulationState {
            temp_heater: self.temp_heater + other.temp_heater,
            temp_tip: self.temp_tip + other.temp_tip,
            temp_solder: self.temp_solder + other.temp_solder,
        }
    }
}

impl Add for SimulationState {
    type Output = SimulationState;

    fn add(self, other: SimulationState) -> SimulationState {
        &self + &other
    }
}

impl Add<&SimulationState> for SimulationState {
    type Output = SimulationState;

    fn add(self, other: &SimulationState) -> SimulationState {
        &self + other
    }
}

impl Add<SimulationState> for &SimulationState {
    type Output = SimulationState;

    fn add(self, other: SimulationState) -> SimulationState {
        self + &other
    }
}

impl Mul<f32> for &SimulationState {
    type Output = SimulationState;

    fn mul(self, other: f32) -> SimulationState {
        SimulationState {
            temp_heater: self.temp_heater * other,
            temp_tip: self.temp_tip * other,
            temp_solder: self.temp_solder * other,
        }
    }
}

impl Mul<f32> for SimulationState {
    type Output = SimulationState;

    fn mul(self, other: f32) -> SimulationState {
        &self * other
    }
}

impl Mul<SimulationState> for f32 {
    type Output = SimulationState;

    fn mul(self, other: SimulationState) -> SimulationState {
        &other * self
    }
}

impl Mul<&SimulationState> for f32 {
    type Output = SimulationState;

    fn mul(self, other: &SimulationState) -> SimulationState {
        other * self
    }
}
