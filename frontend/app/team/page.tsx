"use client";

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {Github, Mail} from "lucide-react"
import Link from "next/link";

export default function TeamPage() {
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
              TEAM PathOs
            </h1>
            <p className="text-lg text-muted-foreground">
              기술 너머, 병리학의 내일을 함께 그려가는 우리 팀을 소개합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "송규원",
                role: "Team Leader / Front-end Developer",
                bio: "프로젝트 관리와 어노테이션 툴 개발을 주도하며, 사용자의 작업 흐름과 인터페이스 최적화에 집중했습니다. 팀 운영과 전체 개발 과정을 총괄했습니다.",
                image: "/profile/1.jpg",
                github: "https://github.com/gyuwonsong",
                email: "gyuwon0722@kookmin.ac.kr",
              },
              {
                name: "유태근",
                role: "Back-end Developer",
                bio: "모델 서버 및 전체 서버 아키텍처 설계를 담당하며, 프론트엔드-모델 간 데이터 처리 파이프라인을 구축하여 AI 기능이 원활하게 동작하도록 지원했습니다.",
                image: "/profile/2.jpg",
                github: "https://github.com/TaegeunYou",
                email: "youngryu10@kookmin.ac.kr",
              },
              {
                name: "정한결",
                role: "AI/Algorithm Researcher",
                bio: "티슈 세그멘테이션 모델 개발과 멀티 파이프라인 구축을 통해 병리 AI 성능 향상에 기여하며, 관련 연구 및 실험을 진행했습니다.",
                image: "/profile/3.jpg",
                github: "https://github.com/kmuhan",
                email: "hkjung1123@gmail.com",
              },
              {
                name: "황현진",
                role: "Front-end Developer",
                bio: "어노테이션 툴과 퍼블릭 스페이스(공유 페이지) 개발을 담당하며, 사용자가 편리하게 협업할 수 있는 인터페이스를 주도적으로 구현했습니다.",
                image: "/profile/4.jpg",
                github: "https://github.com/hyeonjin6530",
                email: "jjini6530@kookmin.ac.kr",
              },
              {
                name: "이정욱",
                role: "Back-end Developer",
                bio: "어플리케이션 서버 설계 및 데이터베이스 구조 최적화를 담당하며, 타일링 기법 구현 등 안정적인 데이터 처리와 서비스 운영을 지원했습니다.",
                image: "/profile/5.jpg",
                github: "https://github.com/ukly",
                email: "dlwjddnr5438@kookmin.ac.kr",
              },
              {
                name: "정현서",
                role: "AI/Algorithm Researcher",
                bio: "셀 세그멘테이션 모델 개발과 멀티 파이프라인 최적화를 통해 병리 AI의 세포 분석 성능을 향상시키며, 관련 연구 및 실험을 진행했습니다.",
                image: "/profile/6.jpg",
                github: "https://github.com/hyunseo24",
                email: "hugemouth@kookmin.ac.kr",
              },
            ].map((member, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                <div className="relative bg-background rounded-lg border border-border/40 overflow-hidden">
                  <div className="aspect-square relative">
                    <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover"/>
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div
                        className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center space-x-3">
                      {member.github && (
                          <Link
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                          >
                            <Button variant="secondary" size="icon" className="rounded-full">
                              <Github className="h-4 w-4"/>
                            </Button>
                          </Link>
                      )}
                      {member.email && (
                          <Button
                              variant="secondary"
                              size="icon"
                              className="rounded-full"
                              onClick={() => {
                                navigator.clipboard.writeText(member.email);
                              }}
                          >
                            <Mail className="h-4 w-4"/>
                          </Button>
                      )}
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
              <div
                  className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm border border-primary/20">
                우리의 이야기
              </div>
              <h2 className="text-3xl font-bold">PathOs가 탄생한 배경</h2>
              <p className="text-lg text-muted-foreground">
                PathOs는 병리학자들이 직면한 실제 문제를 해결하기 위해 시작되었습니다.<br/>
                대용량 병리 이미지를 분석하는 과정에서 발생하는 시간과 노력의 낭비를 줄이고,<br/>
                더 정확하고 효율적인 진단을 돕기 위해 우리 팀은 PathOs를 개발했습니다.<br/>
              </p>
              <p className="text-lg text-muted-foreground">
                우리의 목표는 병리학자들이 AI의 도움을 받아<br/>
                더 많은 환자를 더 정확하게 진단할 수 있도록 돕는 것입니다.<br/>
                이를 위해 우리는 최신 AI 기술과 병리학적 지식을 결합하여<br/>
                사용하기 쉽고 효과적인 솔루션을 만들기 위해 노력하고 있습니다.<br/>
              </p>
            </div>
            <div className="relative aspect-square md:aspect-auto md:h-[400px] rounded-2xl overflow-hidden border border-border/40 backdrop-blur-sm bg-background/30">
              <Image
                src="/pathos-spring.png"
                alt="PathOs 팀"
                fill
                className="object-cover mix-blend-luminosity z-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Thanks To */}
      <section className="py-12 relative">
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30"></div>
        </div>
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl border border-border/40 backdrop-blur-sm bg-background/30">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
            <div className="relative z-10 p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">함께 해주신 분들</h2>
              <p className="text-lg text-muted-foreground mx-auto">
                본 프로젝트는 2025년도 국민대학교 소프트웨어융합대학 캡스톤디자인(졸업작품) 수업의 일환으로 진행되었습니다.<br/>
                기획과 아이디어 제안을 아낌없이 지원해 주신 서울대학교병원 김광수 교수님과 김세훈 선생님,<br/>
                기술적 지원과 지도를 맡아 주신 국민대학교 김영욱 교수님께 깊이 감사드립니다. <br/>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
