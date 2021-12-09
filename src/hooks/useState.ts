export function useState<T>(initialValue: T): [T, (value: T) => void] {
  const wrapper = { value: initialValue } as { value?: T };

  const setValue = (value: T) => {
    wrapper.value = value;
  };

  const proxy = new Proxy(
    {},
    {
      get: (target, prop, receiver) => {
        // console.log(wrapper.value);
        if (!wrapper.value) return undefined;
        // console.log(prop);
        return Reflect.get(wrapper.value as any, prop, receiver);
      },

      set: (target, prop, value) => {
        if (!wrapper.value) return false;
        Reflect.set(wrapper.value as any, prop, value);

        return true;
      },
    }
  );

  return [proxy as T, setValue];
}
