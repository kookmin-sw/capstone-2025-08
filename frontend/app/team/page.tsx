import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Linkedin, Mail, Twitter } from "lucide-react"

export default function TeamPage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute inset-0 bg-gradient-radial from-accent/20 to-transparent"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">PathOs</span>를
              만든 사람들
            </h1>
            <p className="text-lg text-muted-foreground">병리학의 미래를 함께 만들어가는 열정적인 팀을 소개합니다.</p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "김철수",
                role: "CEO & 창립자",
                bio: "10년 이상의 의료 AI 경험을 가진 전문가로, PathOs의 비전과 전략을 이끌고 있습니다.",
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "이영희",
                role: "CTO",
                bio: "컴퓨터 비전 및 딥러닝 전문가로, PathOs의 핵심 기술 개발을 담당하고 있습니다.",
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "박지성",
                role: "수석 연구원",
                bio: "병리학 박사로, AI와 병리학의 융합 연구를 주도하고 있습니다.",
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "정민수",
                role: "프론트엔드 개발 리더",
                bio: "사용자 경험에 중점을 둔 직관적인 인터페이스 개발을 담당하고 있습니다.",
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "최유리",
                role: "백엔드 개발 리더",
                bio: "확장 가능하고 안정적인 시스템 아키텍처 설계 및 구현을 담당하고 있습니다.",
                image: "/placeholder.svg?height=300&width=300",
              },
              {
                name: "홍길동",
                role: "AI 연구원",
                bio: "최신 딥러닝 알고리즘 연구 및 개발을 통해 PathOs의 성능을 향상시키고 있습니다.",
                image: "/placeholder.svg?height=300&width=300",
              },
            ].map((member, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                <div className="relative bg-background rounded-lg border border-border/40 overflow-hidden">
                  <div className="aspect-square relative">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center space-x-3">
                      <Button variant="secondary" size="icon" className="rounded-full">
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="rounded-full">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="icon" className="rounded-full">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-primary font-medium mb-2">{member.role}</p>
                    <p className="text-muted-foreground">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm border border-primary/20">
                우리의 이야기
              </div>
              <h2 className="text-3xl font-bold">PathOs가 탄생한 배경</h2>
              <p className="text-lg text-muted-foreground">
                PathOs는 병리학자들이 직면한 실제 문제를 해결하기 위해 시작되었습니다. 대용량 병리 이미지를 분석하는
                과정에서 발생하는 시간과 노력의 낭비를 줄이고, 더 정확하고 효율적인 진단을 돕기 위해 우리 팀은 PathOs를
                개발했습니다.
              </p>
              <p className="text-lg text-muted-foreground">
                우리의 목표는 병리학자들이 AI의 도움을 받아 더 많은 환자를 더 정확하게 진단할 수 있도록 돕는 것입니다.
                이를 위해 우리는 최신 AI 기술과 병리학적 지식을 결합하여 사용하기 쉽고 효과적인 솔루션을 만들기 위해
                노력하고 있습니다.
              </p>
            </div>
            <div className="relative aspect-square md:aspect-auto md:h-[400px] rounded-2xl overflow-hidden border border-border/40 backdrop-blur-sm bg-background/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0"></div>
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="PathOs 팀"
                fill
                className="object-cover mix-blend-luminosity opacity-80 z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Join Us */}
      <section className="py-12 relative">
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/40 backdrop-blur-sm bg-background/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
            <div className="relative z-10 p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">함께 일해요</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                PathOs 팀은 항상 열정적이고 창의적인 인재를 찾고 있습니다. 병리학의 미래를 함께 만들어갈 동료를
                기다립니다.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  채용 정보 보기
                </Button>
                <Button size="lg" variant="outline">
                  문의하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
