"use client"

import { useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {ArrowRight, Brain, Code, Database, Microscope, Layers, PackageSearch, Network} from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import TechSphere from "@/components/tech-sphere"
import CellAnalysis from "@/components/cell-analysis"
import DataFlow from "@/components/data-flow"
import FeatureCard from "@/components/feature-card"
import SectionHeading from "@/components/section-heading"

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  return (
      <div>
        {/* Hero Section */}
        <section ref={targetRef} className="relative min-h-screen flex items-center pt-12 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F18] to-transparent"></div>
          </div>

          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-2 md:gap-8 items-center">
              <motion.div style={{y, opacity}} className="space-y-8">
                <div
                    className="inline-block rounded-full bg-[#2A3A64]/30 px-3 py-1 text-sm text-blue-500 backdrop-blur-sm border border-blue-500/20">
                  Human-in-the-loop 기반 노코드 병리 AI 서비스
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  PathOs
                </span>
                  <br/>
                  병리학을 위한 <br/>
                  최적의 AI 솔루션
                </h1>
                <p className="text-lg text-[#8A9CC2] max-w-lg">
                  병리학자가 WSI에서 원하는 세포 및 조직을
                  <br />빠르게 학습·추론할수 있도록 돕는 혁신적인 서비스입니다.
                </p>
              </motion.div>

              <motion.div
                  initial={{rotate: 0}}
                  animate={{rotate: 360}}
                  transition={{
                    repeat: Infinity,
                    duration: 20,
                    ease: 'linear',
                  }}
                  className="relative aspect-square md:aspect-auto md:h-[600px]"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <TechSphere/>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <span className="text-[#8A9CC2] text-sm mb-2">스크롤하여 더 알아보기</span>
            <motion.div
                animate={{y: [0, 10, 0]}}
                transition={{repeat: Number.POSITIVE_INFINITY, duration: 1.5}}
                className="w-6 h-10 rounded-full border-2 border-[#2A3A64] flex justify-center p-1"
            >
              <motion.div
                  animate={{ height: ["20%", "60%", "20%"] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                  className="w-1 bg-blue-500 rounded-full"
              ></motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <SectionHeading
                title="PathOs란?"
                subtitle={
                  <>
                    PathOs는 Pathologist Optimal Segmentation의 약자로,<br />
                    병리학자가 WSI(Whole Slide Images)에서 원하는 세포 및 조직을 빠르게 학습·추론할 수 있도록 돕는 <br />
                    Human-in-the-loop 기반의 노코드 병리 AI 서비스입니다.
                  </>
                }          >
              <div className="pt-6 flex justify-center">
                <Link href="/features">
                  <Button variant="outline" className="group border-blue-500/50 hover:border-blue-500 text-white">
                    Explore Features
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </SectionHeading>

            <div className="mt-16 grid md:grid-cols-3 gap-8">
              <FeatureCard
                  icon={<Code className="h-6 w-6" />}
                  title="노코드 솔루션"
                  description="직관적인 UI를 통해 프로젝트 생성부터 어노테이션, 모델 학습까지 모든 과정을 코드 없이 수행할 수 있습니다."
                  delay={0.1}
              />
              <FeatureCard
                  icon={<Database className="h-6 w-6" />}
                  title="최적화된 구조"
                  description="대용량 병리 이미지에 최적화된 프론트엔드–백엔드 통신 구조를 갖추고 있습니다."
                  delay={0.2}
              />
              <FeatureCard
                  icon={<Brain className="h-6 w-6" />}
                  title="Dual-Branch 구조"
                  description="Cell과 Tissue를 모두 처리할 수 있는 멀티 파이프라인 구조로, 최소한의 초기 어노테이션만으로도 높은 정확도의 커스텀 모델 학습이 가능합니다."
                  delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* Cell Analysis Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1 space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="inline-block rounded-full bg-[#2A3A64]/30 px-3 py-1 text-sm text-blue-500 backdrop-blur-sm border border-blue-500/20"
                >
                  실시간 세포 분석
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-3xl font-orbitron font-bold"
                >
                  AI 기반 병리 분석의 <br />
                  새로운 패러다임
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-lg text-[#8A9CC2]"
                >
                  PathOs는 최신 AI 기술을 활용하여 병리학자의 워크플로우를 혁신적으로 개선합니다.
                  <br />복잡한 코딩 지식 없이도 고성능 AI 모델을 학습시키고 활용할 수 있습니다.
                </motion.p>

                <div className="space-y-4">
                  {[
                    {
                      title: "고해상도 의료 이미지 뷰어",
                      description: "십만 픽셀 이상의 병리 이미지를 부드럽게 탐색하며 세포 단위까지 정밀하게 관찰합니다.",
                      delay: 0.3,
                    },
                    {
                      title: "사용자 맞춤 AI 라벨링",
                      description: "연구자 정의 라벨로 나만의 AI를 학습시키고, 실시간 분석 결과를 적용합니다.",
                      delay: 0.4,
                    },
                    {
                      title: "피드백 기반 모델 고도화",
                      description: "사용자의 판단과 수정이 모델 개선으로 이어지며 (Human-in-the-Loop), 스스로 발전하는 AI를 완성합니다.",
                      delay: 0.5,
                    },
                  ].map((feature, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: feature.delay }}
                          viewport={{ once: true, margin: "-100px" }}
                          className="flex items-start"
                      >
                        <div className="mr-2 mt-1 h-5 w-5 text-blue-500">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-5 w-5"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{feature.title}</h3>
                          <p className="text-sm text-[#8A9CC2]">{feature.description}</p>
                        </div>
                      </motion.div>
                  ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                  <Link href="/features">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-glow transition-all duration-300">
                      Explore All Features
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
              </div>

              <div className="order-1 md:order-2 relative aspect-square md:aspect-auto md:h-[500px] rounded-2xl overflow-hidden border border-[#2A3A64]/40 backdrop-blur-sm bg-[#0A0F18]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CellAnalysis />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Data Flow Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <SectionHeading
                title="데이터 흐름 최적화"
                subtitle="PathOs는 대용량 병리 이미지 데이터를 효율적으로 처리하기 위한 최적화된 데이터 흐름 구조를 제공합니다."
            />

            <div className="mt-4 relative">
              <DataFlow />
            </div>

            <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <PackageSearch className="h-6 w-6" />,
                  title: "이미지 캐싱",
                  description: "자주 사용하는 타일과 레이어를 캐싱하여 반복 접근 시에도 지연 없이 빠른 렌더링을 제공합니다.",
                  delay: 0.1,
                },
                {
                  icon: <Network className="h-6 w-6" />,
                  title: "분산 처리",
                  description: "여러 서버에 분산된 연산 처리를 통해 대용량 이미지도 실시간 분석 성능을 유지합니다.",
                  delay: 0.2,
                },
                {
                  icon: <Layers className="h-6 w-6" />,
                  title: "계층적 처리",
                  description: "다양한 해상도의 이미지를 계층적으로 처리하여 효율성을 극대화합니다.",
                  delay: 0.3,
                },
                {
                  icon: <Database className="h-6 w-6" />,
                  title: "정규화된 데이터 구조",
                  description: "이미지, 메타데이터, 어노테이션을 일관된 구조로 관리하여 확장성과 유지보수성을 높입니다.",
                  delay: 0.4,
                },
              ].map((feature, index) => (
                  <FeatureCard
                      key={index}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      delay={feature.delay}
                  />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30"></div>
          </div>
          <div className="container mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative overflow-hidden rounded-2xl border border-[#2A3A64]/40 backdrop-blur-sm bg-[#0A0F18]/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 z-0"></div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10 p-8 md:p-12 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm mb-6 relative"
                >
                  <Microscope className="h-8 w-8 text-blue-500" />
                  <span className="absolute -inset-1 rounded-full border border-blue-500/30 animate-ping opacity-20"></span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-3xl md:text-4xl font-orbitron font-bold mb-4"
                >
                  병리학의 미래를 함께 만들어가세요
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-lg text-[#8A9CC2] max-w-2xl mx-auto mb-8"
                >
                  PathOs와 함께 병리 이미지 분석의 새로운 시대를 열어보세요.
                  <br/>코드 없이도 강력한 AI 모델을 학습시키고 활용할 수 있습니다.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-wrap justify-center gap-4"
                >
                  <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-glow transition-all duration-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Get Started Now</span>
                    <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
  )
}
