import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 브라우저 렌더링 후 클린업
afterEach(() => {
  cleanup()
})
