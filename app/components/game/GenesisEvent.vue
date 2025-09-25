<template>
  <div v-if="visible" ref="rootRef" class="fixed inset-0 bg-black z-[2000] flex items-center justify-center font-mono overflow-hidden opacity-0">
    <!-- Cosmic Dust Canvas -->
    <canvas ref="canvasRef" class="absolute top-0 left-0 w-full h-full"></canvas>

    <!-- White Flash Overlay -->
    <div ref="flashOverlayRef" class="absolute inset-0 bg-white opacity-0 z-[2001]"></div>

    <!-- Text Content -->
    <div class="relative text-white text-center p-8">
      <p ref="textRef" class="text-xl whitespace-pre-wrap"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick, computed } from 'vue'
import type { NarrativeMilestone } from '~~/game/configs'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

const props = defineProps<{
  narrative: NarrativeMilestone | null
}>()

const emit = defineEmits(['close'])
const { t } = useI18n()

const visible = ref(false)
const isTyping = ref(false)
const isClosing = ref(false)
const textRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)
const flashOverlayRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)

const isEpic = computed(() => props.narrative?.intensity === 'epic')

// --- Canvas Cosmic Dust ---
let animationFrameId: number;
const setupCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  gsap.set(canvas, { opacity: 1 })

  const ctx = canvas.getContext('2d')!
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const particles: any[] = []
  const particleCount = isEpic.value ? 200 : 100 // More particles for epic events

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2
    })
  }

  const draw = () => {
    if (!canvasRef.value) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = isEpic.value ? '#FFD700' : '#3899fa' // Gold for epic, Tech Blue for normal
    particles.forEach(p => {
      ctx.beginPath()
      ctx.globalAlpha = p.opacity
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1
    })
    animationFrameId = requestAnimationFrame(draw)
  }
  draw()
}

const stopCanvas = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
}

// --- GSAP Animation Control ---
watch(() => props.narrative, (newNarrative) => {
  if (newNarrative) {
    visible.value = true
    nextTick(() => {
      animateInV24(newNarrative.textKey)
    })
  }
})

// V2.4 Enter Animation: "Data Stream Reassembly"
async function animateInV24(textKey: string) {
  setupCanvas()
  isTyping.value = true
  if (!textRef.value || !rootRef.value) return

  // Initial fade in of the root element
  gsap.to(rootRef.value, { opacity: 1, duration: 0.8, ease: 'power1.inOut' })

  if (isEpic.value && flashOverlayRef.value) {
    // Epic event: Initial energy surge (white-out) using overlay
    gsap.timeline()
      .fromTo(flashOverlayRef.value, 
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      )
      .to(flashOverlayRef.value, { opacity: 0, duration: 0.5, ease: 'power2.in' })
  }

  const fullText = t(textKey)
  let charIndex = 0
  const glitchChars = '█▓▒░<>/{|}|-'

  // Initial container glitch effect
  if (textRef.value) {
    const tl = gsap.timeline()
    tl.fromTo(textRef.value, 
      { filter: 'blur(5px)', scaleX: 1.2, opacity: 0 },
      { filter: 'blur(0px)', scaleX: 1, opacity: 1, duration: 0.5, ease: 'power2.out' }
    )
  }
  await new Promise(resolve => setTimeout(resolve, 500));

  while (charIndex < fullText.length) {
    if (fullText[charIndex] !== ' ' && fullText[charIndex] !== '\n') {
      for (let i = 0; i < (isEpic.value ? 4 : 2); i++) { // More glitch iterations for epic events
        const randomChar = glitchChars[Math.floor(Math.random() * glitchChars.length)];
        textRef.value.innerHTML = fullText.substring(0, charIndex) + randomChar + '<span class="caret"></span>';
        await new Promise(resolve => setTimeout(resolve, isEpic.value ? 15 : 25)); // Faster glitch for epic
      }
    }
    charIndex++;
    textRef.value.innerHTML = fullText.substring(0, charIndex) + '<span class="caret"></span>';
    await new Promise(resolve => setTimeout(resolve, isEpic.value ? 30 : 50)); // Faster typing for epic
  }
  
  isTyping.value = false;
  textRef.value.innerHTML = fullText; // Final text without caret
  setTimeout(() => {
    handleClose()
  }, 3000); // Auto-dismiss after 3 seconds
}


// V2.6 Exit Animation: "Shatter and Ascend"
const handleClose = () => {
  if (isClosing.value || !textRef.value || !rootRef.value) return
  isClosing.value = true

  const split = new SplitText(textRef.value, { type: 'lines, words, chars', reduceWhiteSpace: false })
  const tl = gsap.timeline({
    onComplete: () => {
      split.revert()
      visible.value = false
      emit('close')
      isClosing.value = false
    }
  })

  if (isEpic.value) {
    // Epic exit: Implosion and Big Bang
    tl.to(split.chars, {
      duration: 0.5,
      x: 0,
      y: 0,
      rotation: 0,
      opacity: 0,
      scale: 0.1,
      ease: 'power2.in',
      stagger: {
        each: 0.005,
        from: 'random'
      }
    })
    .to(flashOverlayRef.value, { // White flash using overlay
      opacity: 1,
      duration: 0.1,
      ease: 'power2.out'
    })
    .to(rootRef.value, { // Fade to black
      opacity: 0,
      duration: 1.0,
      ease: 'power2.in'
    })
  } else {
    // Normal exit: Shatter and Ascend
    // 1. Shatter
    tl.to(split.chars, {
      duration: 0.4,
      x: () => gsap.utils.random(-20, 20),
      y: () => gsap.utils.random(-20, 20),
      rotation: () => gsap.utils.random(-90, 90),
      ease: 'power2.out',
      stagger: {
        each: 0.01,
        from: 'random'
      }
    }, 0)

    // 2. Ascend
    tl.to(split.chars, {
      duration: 1,
      y: -150,
      opacity: 0,
      filter: 'blur(10px)',
      ease: 'power1.in',
      stagger: {
        each: 0.02,
        from: 'random'
      }
    }, ">-0.2")

    tl.to(rootRef.value, {
      opacity: 0,
      duration: 1.0,
      ease: 'power2.inOut'
    }, "<")
  }
}

onUnmounted(() => {
  stopCanvas()
})
</script>

<style scoped>
.caret {
  display: inline-block;
  width: 10px;
  height: 1.5em;
  background-color: #FFD700; /* Gold caret for epic events */
  margin-left: 5px;
  animation: blink 1s steps(1) infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
