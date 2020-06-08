export function forward_euler(h, f, y, { add, mul }) {
    return add(y, mul(f(y), h));
}

export function runge_kutta(h, f, y, { add, mul }) {
    const k1 = f(y);
    const k2 = f(add(y, mul(k1, h / 2)));
    const k3 = f(add(y, mul(k2, h / 2)));
    const k4 = f(add(y, mul(k3, h)));

    const k_sum = add(add(add(k1, mul(k2, 2)), mul(k3, 2)), k4);

    return add(y, mul(k_sum, h / 6));
}
