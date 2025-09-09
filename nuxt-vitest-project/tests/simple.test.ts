import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { defineComponent } from 'vue'

const Component = defineComponent({
  template: '<div>Hello world</div>',
})

describe('MyComponent', () => {
  it('renders correctly', () => {
    const wrapper = mount(Component, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn })],
      },
    })
    expect(wrapper.text()).toBe('Hello world')
  })
})