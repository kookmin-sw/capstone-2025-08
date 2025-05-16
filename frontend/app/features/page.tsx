"use client"

import { useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChartLine, TriangleAlert, FileClock, Earth, RefreshCcwDot, Share2 } from "lucide-react"
import { motion, useInView } from "framer-motion"
import MicroscopeView from "@/components/microscope-view"

export default function FeaturesPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const mainFeaturesRef = useRef<HTMLDivElement>(null)
  const dualBranchRef = useRef<HTMLDivElement>(null)
  const featureGridRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  const heroInView = useInView(heroRef, { once: false, amount: 0.3 })
  const mainFeaturesInView = useInView(mainFeaturesRef, { once: false, amount: 0.3 })
  const dualBranchInView = useInView(dualBranchRef, { once: false, amount: 0.3 })
  const featureGridInView = useInView(featureGridRef, { once: false, amount: 0.3 })
  const ctaInView = useInView(ctaRef, { once: false, amount: 0.3 })

  return (
      <div className="space-y-20">
        {/* Hero Section */}
        <motion.section ref={heroRef} className="relative py-12 overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute inset-0 bg-gradient-radial from-accent/20 to-transparent"></div>
          </div>
          <div className="container mx-auto px-4 mt-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto text-center space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold">
                PathOs의 기능
              </h1>
              <p className="text-lg text-muted-foreground">
                병리학자를 위한 최적의 AI 솔루션이 제공하는 핵심 기능을 소개합니다.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Main Features */}
        <motion.section ref={mainFeaturesRef} className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={mainFeaturesInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                  transition={{ duration: 0.8 }}
                  className="order-2 md:order-1"
              >
                <div className="space-y-6">
                  <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm border border-primary/20">
                    노코드 솔루션
                  </div>
                  <h2 className="text-3xl font-bold">
                    직관적인 인터페이스로 <br />
                    코드 없이 AI 모델 학습
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    PathOs는 코딩 지식 없이도 병리 이미지 분석을 위한 <br/>
                    AI 모델을 학습시킬 수 있는 직관적인 인터페이스를 제공합니다. <br/>
                    프로젝트 생성부터 어노테이션, 모델 학습까지 모든 과정을 쉽게 수행할 수 있습니다.
                  </p>
                  <div className="space-y-3">
                    {[
                      "코드 없이 선택만으로 맞춤형 어노테이션 도구 활용",
                      "복잡한 설정 없이 클릭 한 번으로 AI 학습과 배포 완료",
                      "설치 없이 브라우저에서 바로 시작하는 노코드 AI 플랫폼",
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={mainFeaturesInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                            className="flex items-start"
                        >
                          <div className="mr-2 mt-1 h-5 w-5 text-primary">
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
                          <span>{item}</span>
                        </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={mainFeaturesInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  className="order-1 md:order-2 relative aspect-square md:aspect-auto md:h-[400px] rounded-2xl overflow-hidden border border-border/40 backdrop-blur-sm bg-background/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-0"></div>
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  <MicroscopeView />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Dual-Branch Architecture */}
        <motion.section ref={dualBranchRef} className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={dualBranchInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.8 }}
                  className="relative aspect-square md:aspect-auto md:h-[400px] rounded-2xl overflow-hidden border border-border/40 backdrop-blur-sm bg-background/30"
              >
                <Image
                    src='/capstone-2025-08/gland.jpg'
                    alt="Dual-Branch 아키텍처"
                    fill
                    className="object-cover mix-blend-luminosity z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-3/4 h-3/4 relative">
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 rounded-full border-2 border-pathos-deep-purple animate-pulse"></div>
                    <div
                        className="absolute top-1/3 left-1/3 w-1/3 h-1/3 rounded-full border-2 border-pathos-light-blue animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                    ></div>
                    <div
                        className="absolute top-2/5 left-2/5 w-1/5 h-1/5 rounded-full bg-pathos-deep-purple/50 animate-pulse"
                        style={{ animationDelay: "1s" }}
                    ></div>
                  </div>
                </div>
              </motion.div>
              <motion.div
                  initial={{opacity: 0, x: 50}}
                  animate={dualBranchInView ? {opacity: 1, x: 0} : {opacity: 0, x: 50}}
                  transition={{duration: 0.8}}
                  className="space-y-6"
              >
                <div
                    className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary backdrop-blur-sm border border-primary/20">
                  Dual-Branch 아키텍처
                </div>
                <h2 className="text-3xl font-bold">
                  Cell과 Tissue를 동시에 <br/>
                  처리하는 멀티 파이프라인
                </h2>
                <p className="text-lg text-muted-foreground">
                  PathOs의 Dual-Branch 아키텍처는 세포와 조직, <br/>
                  그리고 두 가지를 동시에 처리할 수 있는 혁신적인 구조를 제공합니다. <br/>
                  최소한의 초기 어노테이션만으로도 높은 정확도의 커스텀 모델 학습이 가능합니다.
                </p>
                <div className="space-y-3">
                  {["세포 단위의 미세 정보와 조직 단위의 구조적 정보를 하나의 파이프라인에서 통합 분석", "최소한의 초기 어노테이션만으로 고정밀 커스텀 AI 모델 구축", "모델 설정에 대한 복잡한 고민 없이 최적의 성능을 자동으로 도출"].map(
                      (item, index) => (
                          <motion.div
                              key={index}
                              initial={{opacity: 0, x: 20}}
                              animate={dualBranchInView ? {opacity: 1, x: 0} : {opacity: 0, x: 20}}
                              transition={{duration: 0.5, delay: 0.2 + index * 0.1}}
                              className="flex items-start"
                          >
                            <div className="mr-2 mt-1 h-5 w-5 text-primary">
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
                            <span>{item}</span>
                          </motion.div>
                      ),
                  )}
                </div>
                <div className="pt-4">
                  <Button
                      className="bg-gradient-to-r to-secondary from-primary text-background hover:opacity-90 transition-opacity relative overflow-hidden group">
                    <span className="relative z-10">Learn More</span>
                    <span
                        className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Feature Grid */}
        <motion.section ref={featureGridRef} className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={featureGridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto text-center space-y-4 mb-12"
            >
              <h2 className="text-3xl font-bold">
              <span className="relative">
                더 많은 기능
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary"></span>
              </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                PathOs는 병리학자의 워크플로우를 혁신적으로 개선하는 다양한 기능을 제공합니다.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <RefreshCcwDot className="h-6 w-6" />,
                  title: "Human-in-the-Loop 피드백",
                  description: "사용자의 피드백을 지속적으로 반영하여 모델의 정확도를 향상시킵니다.",
                  delay: 0.1,
                },
                {
                  icon: <TriangleAlert className="h-6 w-6" />,
                  title: "Uncertain ROI 정보 제공",
                  description: "모델이 불확실하게 인식한 영역을 사용자에게 투명하게 제공합니다.",
                  delay: 0.2,
                },
                {
                  icon: <FileClock className="h-6 w-6" />,
                  title: "작업 히스토리 관리",
                  description: "모든 어노테이션 과정을 기록하고, 언제든 이전 상태로 롤백할 수 있습니다.",
                  delay: 0.3,
                },
                {
                  icon: <Share2 className="h-6 w-6" />,
                  title: "모델 및 데이터셋 (옵션) 공유 ",
                  description: "학습한 커스텀 모델과 데이터셋을 커뮤니티 (퍼블릭 스페이스)에 공유하고, 다운로드할 수 있습니다.",
                  delay: 0.4,
                },
                {
                  icon: <ChartLine className="h-6 w-6" />,
                  title: "모델 성능에 대한 차트 제공",
                  description: "커스텀한 모델에 대한 Loss, IoU, F1 Score 지표를 시각화하여 모델 성능을 한눈에 확인할 수 있습니다.",
                  delay: 0.5,
                },
                {
                  icon: <Earth className="h-6 w-6" />,
                  title: "협진을 위한 퍼블릭 스페이스",
                  description: "전 세계 병리학자들이 모델 성능을 공유하고 의견을 나누며 함께 발전할 수 있는 협업 공간을 제공합니다.",
                  delay: 0.6,
                },
              ].map((feature, index) => (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 30 }}
                      animate={featureGridInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.6, delay: feature.delay }}
                      className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                    <div className="relative p-6 bg-background rounded-lg border border-border/40 h-full overflow-hidden min-h-[230px]">
                      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl"></div>
                      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary relative">
                        {feature.icon}
                        <span className="absolute -inset-1 rounded-full border border-primary/30 animate-ping opacity-20"></span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground relative z-10">{feature.description}</p>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section ref={ctaRef} className="py-12 relative">
          <div className="absolute inset-0 -z-10 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30"></div>
          </div>
          <div className="container mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8 }}
                className="relative overflow-hidden rounded-2xl border border-border/40 backdrop-blur-sm bg-background/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 z-0"></div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-pathos-deep-purple/20 rounded-full blur-3xl"></div>
              <div className="absolute -left-20 -top-20 w-80 h-80 bg-pathos-navy/20 rounded-full blur-3xl"></div>

              <div className="relative z-10 p-8 md:p-12 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-3xl md:text-4xl font-bold mb-4"
                >
                  PathOs로 병리 분석의 미래를 경험하세요
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
                >
                  지금 바로 PathOs를 시작하고 병리 이미지 분석의 새로운 패러다임을 경험해보세요.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={ctaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-secondary text-background hover:opacity-90 transition-opacity relative overflow-hidden group"
                  >
                  <span className="relative z-10 flex items-center">
                    Try PathOs Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                    <span className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
  )
}
