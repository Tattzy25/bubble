"use client"

import { useRouter } from "next/navigation"
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern"

export default function LandingPage() {
  const router = useRouter()

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on the hidden access square (bottom-right corner)
    const gridSize = 40
    const squaresX = Math.floor(rect.width / gridSize)
    const squaresY = Math.floor(rect.height / gridSize)

    const clickedSquareX = Math.floor(x / gridSize)
    const clickedSquareY = Math.floor(y / gridSize)

    // Hidden access point: bottom-right square
    if (clickedSquareX === squaresX - 1 && clickedSquareY === squaresY - 1) {
      router.push('/dashboard')
    }
  }

  return (
    <div
      className="relative min-h-screen bg-background overflow-hidden cursor-pointer"
      onClick={handleGridClick}
    >
      <InteractiveGridPattern
        className="[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
        width={40}
        height={40}
        squares={[80, 80]}
        squaresClassName="hover:fill-blue-500"
      />
    </div>
  )
}
