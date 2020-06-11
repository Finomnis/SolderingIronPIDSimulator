mod simple;

pub use simple::SimpleController;

pub trait Controller {
    fn set_target_temperature(&mut self, temperature: f32);
    fn update(&mut self, temperature: f32) -> f32;
}
