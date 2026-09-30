import { HTMLAttributes, useEffect, useRef } from "react"

type LazyDivProps = HTMLAttributes<HTMLDivElement> & {
  /** 화면 하단에서 애니메이션을 시작할 위치를 조정합니다. */
  observerRootMargin?: string
}

/**
 * 스크롤에 따라 화면에 나타날 때 애니메이션 효과를 주는 컨테이너 컴포넌트입니다.
 * IntersectionObserver를 사용하여 구현되었습니다.
 *
 * @param {LazyDivProps} props - div 요소의 속성과 관찰 범위 설정
 * @returns {JSX.Element} 애니메이션 효과가 적용된 div 요소
 */
export const LazyDiv = ({ observerRootMargin, ...props }: LazyDivProps) => {
  const ref = useRef({} as HTMLDivElement)

  useEffect(() => {
    const divElement = ref.current
    // 요소가 화면에 나타나는지 감시합니다.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 화면에 나타나면 'lazy-active' 클래스를 추가하여 애니메이션을 트리거합니다.
            entry.target.classList.add("lazy-active")
            // 한 번 애니메이션이 동작하면 더 이상 감시하지 않습니다.
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: observerRootMargin },
    )
    observer.observe(divElement)

    return () => observer.unobserve(divElement)
  }, [observerRootMargin])
  return <div ref={ref} {...props} />
}
