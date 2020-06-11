use crate::simulation_state::SimulationState;

#[allow(dead_code)]
pub fn forward_euler<F>(h: f32, f: F, y: SimulationState) -> SimulationState
where
    F: Fn(SimulationState) -> SimulationState,
{
    y + h * f(y)
}

#[allow(dead_code)]
pub fn runge_kutta<F>(h: f32, f: F, y: SimulationState) -> SimulationState
where
    F: Fn(SimulationState) -> SimulationState,
{
    let k1 = f(y);
    let k2 = f(y + h * k1 * 0.5);
    let k3 = f(y + h * k2 * 0.5);
    let k4 = f(y + h * k3);

    let k_sum = k1 + 2.0 * k2 + 2.0 * k3 + k4;

    return y + h / 6.0 * k_sum;
}

#[allow(dead_code)]
pub fn runge_kutta_3_8<F>(h: f32, f: F, y: SimulationState) -> SimulationState
where
    F: Fn(SimulationState) -> SimulationState,
{
    let k1 = f(y);
    let k2 = f(y + (1.0 / 3.0) * h * k1);
    let k3 = f(y + (-1.0 / 3.0) * h * k1 + h * k2);
    let k4 = f(y + h * k1 + (-h) * k2 + h * k3);

    let k_sum = k1 + 3.0 * k2 + 3.0 * k3 + k4;

    return y + h / 8.0 * k_sum;
}
