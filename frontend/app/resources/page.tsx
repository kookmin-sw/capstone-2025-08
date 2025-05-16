import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, FileText, Video, Download, ExternalLink } from "lucide-react"

export default function ResourcesPage() {
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
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">PathOs</span>{" "}
              자료
            </h1>
            <p className="text-lg text-muted-foreground">
              PathOs를 더 잘 이해하고 활용하는 데 도움이 되는 다양한 자료들을 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm border border-primary/20">
                문서
              </div>
              <h2 className="text-3xl font-bold">
                상세한 문서로
                <br />
                PathOs 완벽 활용하기
              </h2>
              <p className="text-lg text-muted-foreground">
                PathOs의 모든 기능과 사용법을 상세히 설명한 문서를 제공합니다. 초보자부터 전문가까지 모두가 쉽게
                이해하고 활용할 수 있도록 구성되어 있습니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <BookOpen className="h-5 w-5 mr-2 mt-1 text-primary" />
                  <div>
                    <h3 className="font-medium">시작 가이드</h3>
                    <p className="text-sm text-muted-foreground">PathOs를 처음 사용하는 사용자를 위한 기본 가이드</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="h-5 w-5 mr-2 mt-1 text-primary" />
                  <div>
                    <h3 className="font-medium">API 문서</h3>
                    <p className="text-sm text-muted-foreground">PathOs API의 상세한 사용법과 예제</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Video className="h-5 w-5 mr-2 mt-1 text-primary" />
                  <div>
                    <h3 className="font-medium">튜토리얼</h3>
                    <p className="text-sm text-muted-foreground">단계별 학습을 위한 상세한 튜토리얼</p>
                  </div>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                문서 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="relative aspect-square md:aspect-auto md:h-[400px] rounded-2xl overflow-hidden border border-border/40 backdrop-blur-sm bg-background/30">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0"></div>
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="PathOs 문서"
                fill
                className="object-cover mix-blend-luminosity opacity-80 z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">학습 자료</h2>
            <p className="text-lg text-muted-foreground">
              PathOs를 효과적으로 활용하는 데 도움이 되는 다양한 학습 자료를 제공합니다.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "시작하기 가이드",
                description: "PathOs를 처음 사용하는 사용자를 위한 기본 가이드입니다.",
                icon: <BookOpen className="h-6 w-6" />,
                link: "#",
              },
              {
                title: "비디오 튜토리얼",
                description: "PathOs의 주요 기능을 시각적으로 배울 수 있는 비디오 튜토리얼입니다.",
                icon: <Video className="h-6 w-6" />,
                link: "#",
              },
              {
                title: "API 문서",
                description: "PathOs API의 상세한 사용법과 예제를 제공합니다.",
                icon: <FileText className="h-6 w-6" />,
                link: "#",
              },
              {
                title: "샘플 프로젝트",
                description: "PathOs를 활용한 다양한 샘플 프로젝트를 제공합니다.",
                icon: <Download className="h-6 w-6" />,
                link: "#",
              },
              {
                title: "FAQ",
                description: "자주 묻는 질문과 답변을 모아놓은 문서입니다.",
                icon: <FileText className="h-6 w-6" />,
                link: "#",
              },
              {
                title: "커뮤니티 포럼",
                description: "PathOs 사용자들과 지식과 경험을 공유할 수 있는 커뮤니티 포럼입니다.",
                icon: <ExternalLink className="h-6 w-6" />,
                link: "#",
              },
            ].map((resource, index) => (
              <Link href={resource.link} key={index} className="group">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                  <div className="relative p-6 bg-background rounded-lg border border-border/40 h-full">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                      {resource.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground mb-4">{resource.description}</p>
                    <div className="flex items-center text-primary group-hover:underline">
                      <span>자세히 보기</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Research Papers */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">연구 논문</h2>
            <p className="text-lg text-muted-foreground">
              PathOs의 기술적 배경과 성능에 관한 연구 논문들을 확인하세요.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: "Human-in-the-loop 기반 병리 이미지 분할 시스템의 효율성 연구",
                authors: "김철수, 이영희, 박지성",
                journal: "의료 AI 저널, 2023",
                link: "#",
              },
              {
                title: "Dual-Branch 아키텍처를 활용한 세포 및 조직 동시 분석 방법론",
                authors: "홍길동, 정민수, 최유리",
                journal: "컴퓨터 비전 학회지, 2022",
                link: "#",
              },
              {
                title: "대용량 WSI 처리를 위한 최적화된 프론트엔드-백엔드 통신 구조",
                authors: "박서준, 김민지, 이태호",
                journal: "의료정보학회지, 2023",
                link: "#",
              },
            ].map((paper, index) => (
              <Link href={paper.link} key={index} className="group">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative p-6 bg-background rounded-lg border border-border/40">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                      {paper.title}
                    </h3>
                    <p className="text-muted-foreground">{paper.authors}</p>
                    <p className="text-sm text-muted-foreground">{paper.journal}</p>
                    <div className="mt-4 flex items-center text-primary group-hover:underline">
                      <span>논문 보기</span>
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 relative">
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/40 backdrop-blur-sm bg-background/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
            <div className="relative z-10 p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">더 궁금한 점이 있으신가요?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                PathOs 팀에 문의하시면 더 자세한 정보와 도움을 받으실 수 있습니다.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  문의하기
                </Button>
                <Button size="lg" variant="outline">
                  FAQ 보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
