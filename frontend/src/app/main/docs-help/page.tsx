'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, ArrowRight } from 'lucide-react';
import PageTitle from '@/components/common/page-title';
import { faqs, docCategories } from '@/data/docs-help';

export default function DocsHelpPage() {
  return (
    <div>
      {/* Header */}
      <PageTitle title={'Docs & Help'} />

      {/* FAQ Section */}
      <div className="mb-16">
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600">
                Find quick answers to common questions about PathOs
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="cursor-pointer text-left font-medium text-gray-800">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Documentation Categories */}
      <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {docCategories.map((category, index) => (
          <div
            key={index}
            className="transition-all duration-300 ease-in-out hover:scale-[1.02]"
          >
            <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md">
              <CardContent className="h-full p-6">
                <div className="flex h-full flex-col">
                  <div
                    className={`${category.bgColor} ${category.borderColor} mb-4 flex h-12 w-12 items-center justify-center rounded-xl border p-3 shadow-sm`}
                  >
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-gray-800">
                    {category.title}
                  </h3>
                  <p className="mb-6 flex-grow text-gray-600">
                    {category.description}
                  </p>

                  <Button asChild variant="outline" className="justify-between">
                    <Link href={category.link}>
                      <span>Browse Documentation</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="rounded-full bg-white p-4 shadow-sm">
              <HelpCircle className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Need more help?
              </h3>
              <p className="mb-4 text-gray-600">
                Our support team is available to assist you with any questions
                or issues you may have.
              </p>
              <Button asChild>
                <Link href="/docs/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
