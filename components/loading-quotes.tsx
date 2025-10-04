"use client";

import { useEffect, useState } from "react";

interface Quote {
  text: string;
  author: string;
  book: string;
}

const quotes: Quote[] = [
  {
    text: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero",
    book: "Attributed"
  },
  {
    text: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway",
    book: "Attributed"
  },
  {
    text: "Books are a uniquely portable magic.",
    author: "Stephen King",
    book: "On Writing"
  },
  {
    text: "Reading is to the mind what exercise is to the body.",
    author: "Joseph Addison",
    book: "The Tatler"
  },
  {
    text: "The reading of all good books is like conversation with the finest minds of past centuries.",
    author: "René Descartes",
    book: "Discourse on Method"
  },
  {
    text: "A book is a dream that you hold in your hand.",
    author: "Neil Gaiman",
    book: "Attributed"
  },
  {
    text: "Reading gives us someplace to go when we have to stay where we are.",
    author: "Mason Cooley",
    book: "Attributed"
  },
  {
    text: "The person, be it gentleman or lady, who has not pleasure in a good novel, must be intolerably stupid.",
    author: "Jane Austen",
    book: "Northanger Abbey"
  },
  {
    text: "I have always imagined that Paradise will be a kind of library.",
    author: "Jorge Luis Borges",
    book: "Attributed"
  },
  {
    text: "So many books, so little time.",
    author: "Frank Zappa",
    book: "Attributed"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    book: "Attributed"
  },
  {
    text: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.",
    author: "J.K. Rowling",
    book: "Harry Potter and the Deathly Hallows"
  },
  {
    text: "It is our choices that show what we truly are, far more than our abilities.",
    author: "J.K. Rowling",
    book: "Harry Potter and the Chamber of Secrets"
  },
  {
    text: "The best way to find out if you can trust somebody is to trust them.",
    author: "Ernest Hemingway",
    book: "The Sun Also Rises"
  }
];

export function LoadingQuotes() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[currentQuoteIndex];

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mb-8 relative">
        <div className="w-12 h-12 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-spin border-t-rose-700 dark:border-t-blue-400"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-spin border-r-rose-700 dark:border-r-blue-300" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>

      <div className="max-w-2xl px-8 text-center">
        <div 
          className={`transition-all duration-500 ease-in-out ${
            isVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-4'
          }`}
        >
          <blockquote className="text-2xl md:text-xl font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
            "{currentQuote.text}"
          </blockquote>
          
          <div className="flex flex-col items-center space-y-1">
            <cite className="text-xl font-semibold text-slate-600 dark:text-slate-400 not-italic">
              — {currentQuote.author}
            </cite>
            <cite className="text-lg text-slate-500 dark:text-slate-500 not-italic">
              {currentQuote.book}
            </cite>
          </div>
        </div>
      </div>

      <div className="mt-8 text-lg text-slate-500 dark:text-slate-400 animate-pulse">
        Loading your book...
      </div>

      <div className="mt-4 flex space-x-2">
        {quotes.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentQuoteIndex
                ? 'bg-rose-700 dark:bg-blue-400 scale-125'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
