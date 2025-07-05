export default class Cache<K, V> extends Map<K, V & { stale?: true }> {
  constructor(lifespan: number) {
    super();
    setInterval(() => this.banWave(), lifespan);
  }

  set(key: K, value: V) {
    return super.set(key, {
      ...value,
      stale: undefined,
    });
  }

  get(key: K) {
    const value = super.get(key);
    if (!value) return;

    this.set(key, {
      ...value,
      stale: undefined,
    });

    return {
      ...value,
      stale: undefined,
    };
  }

  update(key: K, value: V) {
    const current = this.get(key) ?? { stale: true };

    this.set(key, {
      ...current,
      ...value,
      stale: undefined,
    });
  }

  banWave() {
    for (const [key, value] of this) {
      if (value && value.stale) this.delete(key);

      this.set(key, {
        ...value,
        stale: true,
      });
    }
  }
}
