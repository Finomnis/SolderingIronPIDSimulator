import { runge_kutta } from "./solver";

const math_helpers = {
    add: (val1, val2) => ({
        temp_heater: val1.temp_heater + val2.temp_heater,
        temp_tip: val1.temp_tip + val2.temp_tip,
        temp_solder: val1.temp_solder + val2.temp_solder,
    }),
    mul: (val1, val2) => ({
        temp_heater: val1.temp_heater * val2,
        temp_tip: val1.temp_tip * val2,
        temp_solder: val1.temp_solder * val2,
    }),
};

export class Simulation {
    constructor({
        heater_max_power,
        thermal_mass_heater,
        thermal_mass_tip,
        thermal_mass_solder,
        thermal_coupling_heater,
        thermal_coupling_air,
        thermal_coupling_solder,
        thermal_coupling_solder_air,
        air_temp,
        time_step,
    }) {
        // Stepping size
        this.time_step = time_step;

        // Simulated values
        this.air_temp = air_temp;
        this.temp_heater = air_temp;
        this.temp_tip = air_temp;
        this.temp_solder = air_temp;
        this.time = 0.0;

        // Constants
        this.heater_max_power = heater_max_power; // W, J/s, Joule per second
        this.thermal_mass_heater = thermal_mass_heater; // J/K, how much joule necessary to heat up by one kelvin
        this.thermal_mass_tip = thermal_mass_tip; // J/K, how much joule necessary to heat up by one kelvin
        this.thermal_mass_solder = thermal_mass_solder; // J/K, how much joule necessary to heat up by one kelvin
        this.thermal_coupling_heater = thermal_coupling_heater; // W/K, how much watt get transfered per kelvin difference
        this.thermal_coupling_air = thermal_coupling_air; // W/K, how much heat gets dissipated per kelvin difference to ambient
        this.thermal_coupling_solder = thermal_coupling_solder; // W/K, how much heat flows into the solder
        this.thermal_coupling_solder_air = thermal_coupling_solder_air; // W/K, how much heat flows into the solder

        // Modulatable values
        this.heater_duty = 1.0;
        this.touches_solder = false;

        // Charts
        this.time_chart_next = 0.0;
        this.chart_temp_heater = [];
        this.chart_temp_tip = [];
        this.chart_temp_solder = [];
        this.chart_heater_duty = [];
        this.chart_touches_solder = [];

        this.update_charts();
    }

    update_charts() {
        if (this.time < this.time_chart_next) return;
        this.time_chart_next += 1.0;

        this.chart_temp_heater.push({ x: this.time, y: this.temp_heater });
        this.chart_temp_tip.push({ x: this.time, y: this.temp_tip });
        this.chart_temp_solder.push({ x: this.time, y: this.temp_solder });
        this.chart_heater_duty.push({ x: this.time, y: this.heater_duty });
        this.chart_touches_solder.push({
            x: this.time,
            y: this.touches_solder ? 1.0 : 0.0,
        });
    }

    update() {
        this.update_temperatures();

        this.time += this.time_step;
        this.update_charts();
    }

    update_temperatures() {
        const f = ({ temp_heater, temp_tip, temp_solder }) => {
            const heater_power = this.heater_max_power * this.heater_duty;

            const power_transferred_heater_tip =
                (temp_heater - temp_tip) * this.thermal_coupling_heater;

            const power_transferred_tip_air =
                (temp_tip - this.air_temp) * this.thermal_coupling_air;

            const power_transferred_tip_solder = this.touches_solder
                ? (temp_tip - temp_solder) * this.thermal_coupling_solder
                : 0.0;

            const power_transferred_solder_air =
                (temp_solder - this.air_temp) *
                this.thermal_coupling_solder_air;

            const deriv_temp_heater =
                (heater_power - power_transferred_heater_tip) /
                this.thermal_mass_heater;
            const deriv_temp_tip =
                (power_transferred_heater_tip -
                    power_transferred_tip_air -
                    power_transferred_tip_solder) /
                this.thermal_mass_tip;
            const deriv_temp_solder =
                (power_transferred_tip_solder - power_transferred_solder_air) /
                this.thermal_mass_solder;

            return {
                temp_heater: deriv_temp_heater,
                temp_tip: deriv_temp_tip,
                temp_solder: deriv_temp_solder,
            };
        };

        const old_values = {
            temp_heater: this.temp_heater,
            temp_tip: this.temp_tip,
            temp_solder: this.temp_solder,
        };

        const new_values = runge_kutta(
            this.time_step,
            f,
            old_values,
            math_helpers
        );

        this.temp_heater = new_values.temp_heater;
        this.temp_tip = new_values.temp_tip;
        this.temp_solder = new_values.temp_solder;
    }

    get_current_temp() {
        return this.temp_tip;
    }

    get_current_time() {
        return this.time;
    }

    set_touches_solder(val) {
        this.touches_solder = val;
    }

    set_heater_duty(val) {
        this.heater_duty = val;
    }
}
