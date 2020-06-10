import { main } from "./main";

import("../wasm/pkg").then((wasm) => {
    main(wasm);
});
