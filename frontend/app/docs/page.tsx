"use client"

import Link from "next/link"
import { ArrowRight, BookOpen, FileText, Video, Download, ExternalLink } from "lucide-react"

export default function DocsPage() {
  return (
      <div className="space-y-20">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute inset-0 bg-gradient-radial from-accent/20 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 mt-20">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                PathOs의 자료
              </h1>
              <p className="text-lg text-muted-foreground">
                PathOs를 더 잘 이해하고 활용하는 데 도움이 되는 다양한 자료들을 제공합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Poster */}
        <section className="py-6">
          <div className="container px-4">
            <div className="flex justify-center">
              <h2 className="text-3xl font-bold">
              <span className="relative">
                포스터
                <span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></span>
              </span>
              </h2>
            </div>
            <div className="flex justify-center mt-6">
              <img
                  src='/capstone-2025-08/pathos-poster.svg'
                  alt="포스터"
                  className="w-2/3 h-auto"
              />
            </div>
          </div>
        </section>

        {/* Research Papers */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">
              <span className="relative">
                연구 자료
                <span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></span>
              </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                PathOs의 기술적 배경과 성능에 대한 연구 자료를 소개합니다.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {[
                {
                  title: "OCELOT: Overlapped Cell on Tissue Dataset for Histopathology",
                  description: "모델 파트의 다음 발전 방향 제시, Future works: Tissue + Cell",
                  link: "https://arxiv.org/pdf/2303.13110",
                },
                {
                  title: "MONAI Label Active Learning",
                  description: "Human-in-the-loop 기능을 제공하는 선행 연구",
                  link: "https://github.com/Project-MONAI/MONAILabel/wiki/Active-Learning",
                },
                {
                  title: "Human-in-the-loop for PathOs",
                  description: "사용자의 피드백을 반영해 모델을 지속적으로 개선하는 PathOs만의 상호작용 기반 학습 프로세스",
                  link: "https://drive.google.com/uc?export=download&id=1BROaqL2f95cYbfirz9awTkIuNP4Z2HwY",
                },
              ].map((paper, index) => (
                  <Link href={paper.link} key={index} className="group" target="_blank" rel="noopener noreferrer">
                    <div className="relative">
                      <div
                          className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                      <div className="relative p-6 bg-background rounded-lg border border-border/40">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {paper.title}
                        </h3>
                        <p className="text-muted-foreground">{paper.description}</p>
                        <div className="mt-4 flex items-center text-primary group-hover:underline">
                          <span>자료 보기</span>
                          <ExternalLink className="ml-2 h-4 w-4"/>
                        </div>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">
              <span className="relative">
                학습 자료
                <span
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></span>
              </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                PathOs를 효과적으로 활용하는 데 도움이 되는 다양한 학습 자료를 제공합니다.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "시작하기 가이드",
                  description: "PathOs를 처음 사용하는 사용자를 위한 기본 가이드입니다.",
                  icon: <BookOpen className="h-6 w-6"/>,
                  link: "#",
                },
                {
                  title: "비디오 튜토리얼",
                  description: "PathOs의 주요 기능을 시각적으로 배울 수 있는 비디오 튜토리얼입니다.",
                  icon: <Video className="h-6 w-6"/>,
                  link: "#",
                },
                {
                  title: "API 문서",
                  description: "PathOs API의 상세한 사용법과 예제를 제공합니다.",
                  icon: <FileText className="h-6 w-6"/>,
                  link: "#",
                },
                {
                  title: "샘플 프로젝트",
                  description: "PathOs를 활용한 다양한 샘플 프로젝트를 제공합니다.",
                  icon: <Download className="h-6 w-6"/>,
                  link: "#",
                },
                {
                  title: "FAQ",
                  description: "자주 묻는 질문과 답변을 모아놓은 문서입니다.",
                  icon: <FileText className="h-6 w-6"/>,
                  link: "#",
                },
                {
                  title: "커뮤니티 포럼",
                  description: "PathOs 사용자들과 지식과 경험을 공유할 수 있는 커뮤니티 포럼입니다.",
                  icon: <ExternalLink className="h-6 w-6"/>,
                  link: "#",
                },
              ].map((resource, index) => (
                  <Link href={resource.link} key={index} className="group">
                    <div className="relative">
                      <div
                          className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                      <div
                          className="relative p-6 bg-background rounded-lg border border-border/40 min-h-[240px] flex flex-col justify-between h-full">
                        <div>
                          <div
                              className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                            {resource.icon}
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                          <p className="text-muted-foreground mb-4 flex-grow">{resource.description}</p>
                        </div>
                        <div className="flex items-center text-primary group-hover:underline mt-auto">
                          <span>자세히 보기</span>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"/>
                        </div>
                      </div>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
  )
}
