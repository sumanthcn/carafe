<template>
  <div class="oss">
    <!-- Off-path: cancelled or refunded -->
    <div v-if="isOffPath" :class="['oss__offpath', `oss__offpath--${offPathInfo.color}`]">
      <span class="oss__offpath-icon">{{ offPathInfo.icon }}</span>
      <span class="oss__offpath-label">{{ offPathInfo.label }}</span>
    </div>

    <!-- Main horizontal stepper -->
    <div v-else class="oss__track">
      <div v-for="(seg, i) in segments" :key="seg.key" class="oss__seg">
        <!-- Step node -->
        <div :class="['oss__step', { 'oss__step--done': seg.done, 'oss__step--active': seg.active }]">
          <div class="oss__circle">
            <!-- Completed tick -->
            <svg v-if="seg.done" class="oss__tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <!-- Active pulse dot -->
            <span v-else-if="seg.active" class="oss__pulse"></span>
            <!-- Future number -->
            <span v-else class="oss__num">{{ i + 1 }}</span>
          </div>
          <span class="oss__label">{{ seg.label }}</span>
          <span v-if="seg.active && !seg.done" class="oss__sublabel">Current</span>
        </div>

        <!-- Connector line (between this step and the next) -->
        <div
          v-if="i < segments.length - 1"
          :class="['oss__conn', { 'oss__conn--done': seg.done, 'oss__conn--transit': seg.transitActive }]"
        >
          <div class="oss__conn-line"></div>
          <span v-if="seg.transitActive" class="oss__conn-badge">In Transit</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>();

const STEPS = [
  { key: 'order_received', label: 'Order Received' },
  { key: 'packed',         label: 'Packed' },
  { key: 'shipped',        label: 'Shipped' },
  { key: 'delivered',      label: 'Delivered' },
];

// Numeric position along the stepper (2.5 = between shipped and delivered)
const STATUS_POS: Record<string, number> = {
  order_received: 0,
  packed:         1,
  shipped:        2,
  in_transit:     2.5,
  delivered:      3,
};

const isOffPath = computed(() =>
  props.status === 'cancelled' || props.status === 'refunded'
);

const offPathInfo = computed(() => {
  if (props.status === 'cancelled') return { label: 'Order Cancelled', icon: '✕', color: 'red' };
  if (props.status === 'refunded')  return { label: 'Order Refunded',  icon: '↩', color: 'orange' };
  return { label: '', icon: '', color: 'gray' };
});

const segments = computed(() => {
  const pos = STATUS_POS[props.status] ?? 0;
  const isDelivered = props.status === 'delivered';

  return STEPS.map((step, i) => {
    // A step is "done" when the current position is strictly past it,
    // or when delivered (all steps complete including the last).
    const done = i < pos || (isDelivered && i === STEPS.length - 1);
    // A step is "active" when it exactly matches the floor of pos (integer pos only)
    const active = !done && i === Math.floor(pos) && pos % 1 === 0;
    // The connector after step i shows "In Transit" badge when we're mid-way (pos = 2.5)
    const transitActive = i === 2 && pos === 2.5;
    return { ...step, done, active, transitActive };
  });
});
</script>

<style lang="scss" scoped>
$oss-done-text: #ffffff;
$oss-future-bg: #f3f4f6;
$oss-future-border: #d1d5db;
$oss-future-text: #6b7280;
$oss-line-future: #e5e7eb;
$oss-transit-badge-bg: #e0e7ff;
$oss-transit-badge-text: #3730a3;

.oss {
  width: 100%;
}

// Off-path states (cancelled / refunded)
.oss__offpath {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;

  &--red    { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }

  .oss__offpath-icon {
    font-size: 1.1rem;
  }
}

// Stepper track: circles + connectors in a horizontal row
.oss__track {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

// Transparent wrapper per iteration (display:contents = invisible to flexbox)
.oss__seg {
  display: contents;
}

// Individual step
.oss__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 72px;
  position: relative;
}

.oss__circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid $oss-future-border;
  background: $oss-future-bg;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background 0.3s, border-color 0.3s;
  flex-shrink: 0;
}

.oss__num {
  font-size: 0.8rem;
  font-weight: 600;
  color: $oss-future-text;
  line-height: 1;
}

.oss__tick {
  width: 16px;
  height: 16px;
  color: $oss-done-text;
}

.oss__pulse {
  width: 12px;
  height: 12px;
  background: $color-primary;
  border-radius: 50%;
  animation: oss-pulse 1.4s ease-in-out infinite;
}

@keyframes oss-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(1.4); opacity: 0.5; }
}

.oss__label {
  font-size: 0.7rem;
  color: $oss-future-text;
  margin-top: 0.4rem;
  text-align: center;
  white-space: nowrap;
  font-weight: 500;
  line-height: 1.2;
}

.oss__sublabel {
  font-size: 0.62rem;
  color: $color-primary;
  text-align: center;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-top: 0.1rem;
}

// Done state
.oss__step--done {
  .oss__circle {
    background: $color-primary;
    border-color: $color-primary;
  }
  .oss__label {
    color: $color-primary;
    font-weight: 700;
  }
}

// Active state
.oss__step--active {
  .oss__circle {
    border-color: $color-primary;
    background: rgba($color-primary, 0.08);
  }
  .oss__label {
    color: $color-primary;
    font-weight: 700;
  }
}

// Connector between steps
.oss__conn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  // vertically centred with the circles (which are 36px tall, offset by ~2px top border)
  margin-top: 17px; // (36px / 2) - 1px = 17px
  min-width: 20px;
}

.oss__conn-line {
  width: 100%;
  height: 2px;
  background: $oss-line-future;
  border-radius: 1px;
  transition: background 0.3s;
}

// Connector after a completed step → use primary colour
.oss__conn--done .oss__conn-line {
  background: $color-primary;
}

// Connector with "In Transit" badge
.oss__conn--transit .oss__conn-line {
  background: linear-gradient(90deg, $color-primary 0%, $oss-transit-badge-bg 100%);
}

.oss__conn-badge {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  background: $oss-transit-badge-bg;
  color: $oss-transit-badge-text;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.15rem 0.45rem;
  border-radius: 2rem;
  white-space: nowrap;
  line-height: 1.4;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
