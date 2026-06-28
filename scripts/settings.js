const pruningStates = [
    {
        text: "✖",
        left: "2px"
    },
    {
        text: "M",
        left: "26px"
    },
    {
        text: "H",
        left: "50px"
    }
];

document.querySelectorAll(".tri-switch").forEach(sw => {

    const knob = sw.querySelector(".tri-knob");

    let state = 0;

    sw.addEventListener("click", () => {

        state = (state + 1) % 3;

        knob.textContent =
            pruningStates[state].text;

        knob.style.left =
            pruningStates[state].left;

        sw.dataset.state = state;
    });
});


document.querySelectorAll(".player-settings")
    .forEach(card => {

        const toggle =
            card.querySelector(".enable-toggle");

        const heuristic =
            card.querySelector(".heuristic-toggle");

        const dependents =
            card.querySelectorAll(".dependent");

        function update() {
            if (toggle.checked && heuristic.checked) {
                heuristic.checked = false;
            }

            dependents.forEach(el => {
                el.classList.toggle(
                    "disabled",
                    !toggle.checked
                );
            });
        }

        function updateHeuristic() {
            if (toggle.checked && heuristic.checked) {
                toggle.checked = false;
            }
            update();
        }

        toggle.addEventListener(
            "change",
            update
        );

        heuristic.addEventListener(
            "change",
            updateHeuristic
        )

        update();
    });

function getSettings() {

    const cards =
        document.querySelectorAll(
            ".player-settings"
        );

    return [...cards].map(card => ({

        enabled:
        card.querySelector(
            ".enable-toggle"
        ).checked,

        heuristic:
        card.querySelector(".heuristic-toggle").checked,

        pruning:
            ["off", "minimax", "heuristic"][
                Number(
                    card.querySelector(
                        ".tri-switch"
                    ).dataset.state
                )
                ],

        depth:
            Number(
                card.querySelector(
                    ".depth-input"
                ).value
            )
    }));
}
