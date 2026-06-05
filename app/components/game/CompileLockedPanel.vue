<template>
  <section class="locked-panel">
    <header>
      <div>
        <p>RELEASE PIPELINE</p>
        <h2>{{ $t('common.compileRelease') }}</h2>
      </div>
      <span>
        <Icon name="mdi:lock-outline" />
        LOCKED
      </span>
    </header>

    <div class="locked-body">
      <Icon name="mdi:package-variant-closed" />
      <div>
        <strong>{{ $t('common.unlockCondition') }}</strong>
        <p>{{ $t('common.compileUnlockRequirement', { rp: unlockRequirement }) }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  unlockRequirement: number
}>()
</script>

<style scoped>
.locked-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(142, 173, 204, 0.16);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.88), rgba(8, 15, 24, 0.94)),
    radial-gradient(circle at 18% 0%, rgba(45, 212, 191, 0.08), transparent 34%);
  box-shadow: inset 0 0 28px rgba(0, 0, 0, 0.32);
  padding: 14px;
}

.locked-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(255, 255, 255, 0.014) 5px, rgba(255, 255, 255, 0.014) 6px);
}

.locked-panel header,
.locked-body {
  position: relative;
  z-index: 1;
}

.locked-panel header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(142, 173, 204, 0.12);
  padding-bottom: 12px;
}

.locked-panel header p {
  color: #38bdf8;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.locked-panel h2 {
  margin-top: 2px;
  color: #cbd5e1;
  font-size: 1rem;
  font-weight: 800;
}

.locked-panel header span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(142, 173, 204, 0.18);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.52);
  color: #8eadcc;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.68rem;
  font-weight: 900;
  padding: 6px 10px;
}

.locked-body {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 14px;
  border: 1px solid rgba(56, 153, 250, 0.1);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.56);
  padding: 12px;
}

.locked-body > .iconify {
  flex: 0 0 auto;
  color: #8eadcc;
  font-size: 2rem;
}

.locked-body strong {
  display: block;
  color: #e5f3ff;
  font-size: 0.82rem;
  font-weight: 800;
}

.locked-body p {
  margin-top: 3px;
  color: #8eadcc;
  font-size: 0.72rem;
  line-height: 1.5;
}

</style>
