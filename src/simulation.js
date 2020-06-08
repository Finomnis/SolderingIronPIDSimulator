const TIME_STEP = 0.2;
const AIR_TEMP = 25.0;

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
    }) {
        // Simulated values
        this.temp_heater = AIR_TEMP;
        this.temp_tip = AIR_TEMP;
        this.temp_solder = AIR_TEMP;
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
        this.chart_temp_heater = [];
        this.chart_temp_tip = [];
        this.chart_temp_solder = [];
        this.chart_heater_duty = [];
        this.chart_touches_solder = [];

        this.update_charts();
    }

    update_charts() {
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

        this.time += TIME_STEP;
        this.update_charts();
    }

    update_temperatures() {
        const f = ({ temp_heater, temp_tip, temp_solder }) => {
            const heater_power = this.heater_max_power * this.heater_duty;

            const power_transferred_heater_tip =
                (temp_heater - temp_tip) * this.thermal_coupling_heater;

            const power_transferred_tip_air =
                (temp_tip - AIR_TEMP) * this.thermal_coupling_air;

            const power_transferred_tip_solder = this.touches_solder
                ? (temp_tip - temp_solder) * this.thermal_coupling_solder
                : 0.0;

            const power_transferred_solder_air =
                (temp_solder - AIR_TEMP) * this.thermal_coupling_solder_air;

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

            return { deriv_temp_heater, deriv_temp_tip, deriv_temp_solder };
        };

        const { deriv_temp_heater, deriv_temp_tip, deriv_temp_solder } = f({
            temp_heater: this.temp_heater,
            temp_tip: this.temp_tip,
            temp_solder: this.temp_solder,
        });

        this.temp_heater += deriv_temp_heater * TIME_STEP;
        this.temp_tip += deriv_temp_tip * TIME_STEP;
        this.temp_solder += deriv_temp_solder * TIME_STEP;
    }

    get_current_temp() {
        return this.temp_tip;
    }

    set_touches_solder(val) {
        this.touches_solder = val;
    }

    set_heater_duty(val) {
        this.heater_duty = val;
    }
}
