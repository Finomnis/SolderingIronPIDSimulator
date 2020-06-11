use crate::controllers::Controller;

pub struct SimpleController {
    target_temperature: f32,
}

impl Controller for SimpleController {
    fn set_target_temperature(&mut self, temperature: f32) {
        self.target_temperature = temperature;
    }

    fn update(&mut self, temperature: f32) -> f32 {
        if temperature > self.target_temperature {
            0.0
        } else {
            1.0
        }
    }
}

impl SimpleController {
    pub fn new() -> SimpleController {
        SimpleController {
            target_temperature: 0.0,
        }
    }
}
