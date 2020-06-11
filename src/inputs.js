function log_to_lin(min, max, value) {
    return Math.log(value / min) / Math.log(max / min);
}

function lin_to_log(min, max, value) {
    return min * Math.pow(max / min, value);
}

export function createInputs(updateSimulation, settings) {
    let table = document.createElement("table");

    let default_dettings = { ...settings };

    let reset_handlers = [];

    let createInput = (id, name, min, max, unit) => {
        // Create Cell
        let value_elem = document.createElement("div");
        let update_value = () => {
            value_elem.innerText =
                Number.parseFloat(settings[id]).toPrecision(3) + " " + unit;
        };
        update_value();

        let input_elem = document.createElement("input");
        input_elem.setAttribute("type", "range");
        input_elem.setAttribute("min", 0);
        input_elem.setAttribute("max", 1);
        input_elem.setAttribute("step", "any");
        input_elem.value = log_to_lin(min, max, settings[id]);

        let input_handler = () => {
            const prev_value = log_to_lin(min, max, settings[id]);
            const current_value = input_elem.valueAsNumber;
            if (prev_value == current_value) return;

            settings[id] = lin_to_log(min, max, current_value);
            update_value();
            updateSimulation();
            console.log(min, max, current_value, settings[id]);
        };

        let reset_handler = () => {
            update_value();
            input_elem.value = log_to_lin(min, max, settings[id]);
        };
        reset_handlers.push(reset_handler);

        input_elem.oninput = input_handler;

        let input_cell = document.createElement("td");
        input_cell.appendChild(value_elem);
        input_cell.appendChild(input_elem);

        // Create label
        let name_cell = document.createElement("td");
        name_cell.innerText = name;

        // Connect
        let row = document.createElement("tr");
        row.appendChild(input_cell);
        row.appendChild(name_cell);
        table.appendChild(row);
    };

    createInput("heater_max_power", "Heater Power", 1, 300, "W");
    createInput(
        "thermal_mass_heater",
        "Thermal Mass of Heating Element",
        0.1,
        100,
        "J/K"
    );
    createInput(
        "thermal_mass_tip",
        "Thermal Mass of Soldering Tip",
        0.1,
        100,
        "J/K"
    );
    createInput(
        "thermal_mass_solder",
        "Thermal Mass of Solder Blob",
        0.1,
        100,
        "J/K"
    );
    createInput(
        "thermal_coupling_heater",
        "Heat flow from Heater to Tip",
        0.01,
        30,
        "W/K"
    );
    createInput(
        "thermal_coupling_air",
        "Heat flow from Tip to Air",
        0.001,
        1,
        "W/K"
    );
    createInput(
        "thermal_coupling_solder",
        "Heat flow from Tip to Solder Blob",
        0.01,
        30,
        "W/K"
    );
    createInput(
        "thermal_coupling_solder_air",
        "Heat flow from Solder Blob to Air",
        0.001,
        1,
        "W/K"
    );
    createInput("air_temp", "Air Temperature", 1, 100, "°C");

    // Create reset button
    let reset_button = document.createElement("input");
    reset_button.value = "Reset";
    reset_button.setAttribute("type", "button");
    reset_button.onclick = () => {
        Object.assign(settings, default_dettings);
        updateSimulation();
        reset_handlers.forEach((reset_handler) => {
            reset_handler();
        });
    };
    let reset_elem = document.createElement("td");
    reset_elem.appendChild(reset_button);
    let reset_row = document.createElement("tr");
    reset_row.appendChild(reset_elem);
    table.appendChild(reset_row);

    let inputDiv = document.getElementById("inputs");
    inputDiv.appendChild(table);
}
