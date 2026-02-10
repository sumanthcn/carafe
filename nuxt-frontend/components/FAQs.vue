<template>
  <section class="faqs-section">
    <div class="container">
      <h2 v-if="title" class="faqs-title">{{ title }}</h2>
      
      <div class="faqs-list">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="faq-item"
          :class="{ active: activeIndex === index }"
        >
          <button
            class="faq-question"
            @click="toggleFaq(index)"
            :aria-expanded="activeIndex === index"
          >
          <span class="faq-icon">{{ activeIndex === index ? '−' : '+' }}</span>
            <span>{{ faq.question }}</span>
          </button>
          <transition name="faq-answer">
            <div v-show="activeIndex === index" class="faq-answer">
              <div class="faq-answer-content" v-html="parseMarkdown(faq.answer)"></div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { parseMarkdown } = useMarkdown();

interface FAQ {
  question: string;
  answer: string;
}

interface FAQsProps {
  title?: string;
  faqs?: FAQ[];
}

const props = defineProps<FAQsProps>();

const activeIndex = ref<number | null>(0); // Default first item open

function toggleFaq(index: number) {
  activeIndex.value = activeIndex.value === index ? null : index;
}
</script>

<style lang="scss" scoped>
.faqs-section {
  padding: 4rem 2rem;
  background: $color-background;

  .container {
    max-width: 1200px;
    margin: 0 auto;
     @media (max-width: 767px) {
      padding: 0;
    }
  }

  .faqs-title {
    font-family: $font-heading;
    font-size: $font-size-4xl;
    color: $color-text;
    text-align: center;
    margin-bottom: 3rem;
    text-transform: uppercase;
    font-weight: bold;
  }

  .faqs-list {
    max-width: 900px;
    margin: 0 auto;
  }

  .faq-item {
    border-bottom: 1px solid $color-text;
    margin-bottom: 0;
    transition: all 0.3s ease;

    &.active {
      .faq-question {
        color: $color-text;
      }
    }

    .faq-question {
      width: 100%;
      display: flex;
      align-items: center;
      padding: 1.5rem 2rem 1.5rem 0;
      background: none;
      border: none;
      cursor: pointer;
      font-family: $font-heading;
      font-size: $font-size-lg;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: $color-text;
      text-align: left;
      transition: color 0.3s ease;
      gap: 1rem;

      @media (max-width: 767px) {
        font-size: $font-size-base;
        padding: 1.25rem 1rem 1.25rem 0;
      }

      .faq-icon {
        font-size: 1.5rem;
        font-weight: 300;
        transition: transform 0.3s ease;
        flex-shrink: 0;
        padding: 0 1rem;
        border: 1px solid $color-text;
        border-radius: 10px;
      }
    }

    .faq-answer {
      overflow: hidden;
      
      .faq-answer-content {
        padding: 0 2rem 2rem 0;
        font-family: $font-body;
        font-weight: 500;
        color: $color-text;
        font-size: $font-size-base;
        line-height: 1.6;

        @media (max-width: 767px) {
          padding: 0 1rem 1.5rem 0;
        }

        :deep(p) {
          margin-bottom: 1rem;
        }

        :deep(a) {
          color: $color-primary-light;
          text-decoration: underline;
          transition: color 0.2s ease;

          &:hover {
            color: darken($color-primary-light, 10%);
          }
        }

        :deep(strong) {
          font-weight: 700;
        }

        :deep(ul),
        :deep(ol) {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        :deep(li) {
          margin-bottom: 0.5rem;
        }
      }
    }
  }
}

// Accordion animation
.faq-answer-enter-active,
.faq-answer-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.faq-answer-enter-from,
.faq-answer-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
