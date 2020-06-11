import Chart from "chart.js";

export function createCharts() {
    let tempChart = new Chart(
        document.getElementById("tempChart").getContext("2d"),
        {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "Heater",
                        data: [],
                        borderColor: "red",
                        pointRadius: 0,
                    },
                    {
                        label: "Tip",
                        data: [],
                        borderColor: "blue",
                        pointRadius: 0,
                    },
                    {
                        label: "Solder",
                        data: [],
                        borderColor: "green",
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    //duration: 0, // general animation time
                },
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                                callback: function (value, index, values) {
                                    return value + " °C";
                                },
                            },
                        },
                    ],
                    xAxes: [
                        {
                            type: "linear",
                            ticks: {
                                beginAtZero: true,
                                callback: function (value, index, values) {
                                    return value + " s";
                                },
                            },
                        },
                    ],
                },
            },
        }
    );

    let dutyChart = new Chart(
        document.getElementById("dutyChart").getContext("2d"),
        {
            type: "line",
            data: {
                datasets: [
                    {
                        label: "Touches Solder",
                        data: [],
                        borderColor: "green",
                        pointRadius: 0,
                    },
                    {
                        label: "Heater Duty",
                        data: [],
                        borderColor: "red",
                        pointRadius: 0,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    //duration: 0, // general animation time
                },
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true,
                            },
                        },
                    ],
                    xAxes: [
                        {
                            type: "linear",
                            ticks: {
                                beginAtZero: true,
                                callback: function (value, index, values) {
                                    return value + " s";
                                },
                            },
                        },
                    ],
                },
            },
        }
    );
    return { tempChart, dutyChart };
}
