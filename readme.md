# 🧠 Software Engineering Knowledge & Debugging Platform

> An AI-powered developer assistant that understands a software repository through **code, documentation, architecture, database design, API specifications, GitHub issues, pull requests, and development history** using **RAG, LangChain, vector search, and LLM-based reasoning**.

---

## 📌 Overview

The **Software Engineering Knowledge & Debugging Platform** is an AI-powered system designed to help software developers understand, navigate, debug, and reason about complex software projects.

Instead of asking an LLM generic questions about a codebase, the platform first retrieves relevant information from the actual project repository and then uses an LLM to reason over that context.

The initial knowledge source for the project will be the **Grandel Hotel Booking Platform repository**.

The system will ingest:

* Source code
* README files
* Technical documentation
* Architecture documentation
* Database design
* API documentation
* Feature documentation
* Workflow diagrams and descriptions
* Testing documentation
* Troubleshooting documentation
* GitHub Issues
* Pull Requests
* Commit history

The platform converts this information into a searchable engineering knowledge base.

Developers can then ask questions such as:

> "How does the booking system work?"

> "Which files are responsible for creating a booking?"

> "How are users and bookings related in the database?"

> "Why might the booking API return a 500 error?"

> "Was the authentication system recently modified?"

> "Have we previously encountered a similar booking issue?"

The system retrieves relevant evidence and generates a grounded response with source references.

---

# 🎯 Problem Statement

Modern software projects contain a large amount of distributed engineering knowledge.

A developer may need to understand:

```text
Source Code
Documentation
Database Schema
API Endpoints
Architecture
Tests
GitHub Issues
Pull Requests
Commit History
```

This information is usually distributed across multiple files and systems.

Traditional keyword search is often insufficient because developers may not know:

* the exact file name
* the exact function name
* the terminology used by the original developer
* where the relevant information is documented

An LLM alone also cannot reliably answer repository-specific questions because it does not automatically know the private codebase or its development history.

Therefore, this project combines:

```text
Repository Knowledge
        +
Semantic Retrieval
        +
RAG
        +
LLM Reasoning
        +
Developer Tools
```

to create an AI engineering assistant grounded in the actual repository.

---

# 🎯 Objectives

The main objectives are:

* Build an AI system that understands an entire software repository.
* Create a repository-specific knowledge base using RAG.
* Use semantic search to retrieve relevant engineering information.
* Combine code, documentation, issues, PRs, and Git history.
* Use LangChain for retrieval and AI orchestration.
* Use ChromaDB for vector-based semantic retrieval.
* Use Gemini as the reasoning and generation model.
* Provide source-aware answers.
* Support code understanding and explanation.
* Support debugging investigations.
* Support architecture and database understanding.
* Support GitHub issue and development-history search.
* Build an adaptive AI agent capable of selecting appropriate tools.
* Evaluate retrieval quality and answer faithfulness.

---

# ⭐ Key Features

## 1. Repository Ingestion

Connect a GitHub repository and automatically collect relevant project information.

Supported sources:

```text
Source Code
README
Markdown Documentation
API Documentation
Architecture Documentation
Database Documentation
Testing Documentation
Troubleshooting Documentation
GitHub Issues
Pull Requests
Commit History
```

---

## 2. Intelligent Code Processing

Source code should not be treated exactly like normal text.

The system identifies:

* programming language
* file path
* classes
* functions
* methods
* modules
* imports
* comments
* configuration files

Code-aware chunking is used wherever possible.

---

## 3. Semantic Search

Developers can ask questions using natural language.

Example:

```text
"Where is user authentication implemented?"
```

The system does not require the developer to know the exact file name.

Semantic search retrieves conceptually relevant information.

---

## 4. RAG-Based Question Answering

The platform follows:

```text
User Query
    ↓
Query Analysis
    ↓
Retrieval
    ↓
Relevant Repository Context
    ↓
LLM
    ↓
Grounded Answer
```

The model should answer using retrieved project evidence rather than inventing repository details.

---

## 5. Hybrid Retrieval

The retrieval system can combine:

```text
Semantic Search
+
Keyword Search
+
Metadata Filtering
```

This improves retrieval for queries involving:

* function names
* API routes
* class names
* technologies
* error messages
* file paths

---

## 6. Reranking

Initial retrieval may return many potentially relevant chunks.

A reranking stage can reorder them according to their relevance to the query.

```text
Query
 ↓
Initial Retrieval
 ↓
Top N Results
 ↓
Reranker
 ↓
Top K Relevant Results
 ↓
LLM
```

---

## 7. Source Citations

Answers should identify where the information came from.

Example:

```text
The booking request is handled by the booking controller.

Sources:
- backend/controllers/bookingController.js
- backend/routes/bookingRoutes.js
- docs/features/booking-system.md
```

The system should never claim that information came from a source that was not actually retrieved.

---

# 🏗️ System Architecture

```text
                         Developer
                             │
                             ↓
                    React / Next.js UI
                             │
                             ↓
                         FastAPI
                             │
                 ┌───────────┴───────────┐
                 ↓                       ↓
          Query Orchestrator       Repository Manager
                 │                       │
                 ↓                       ↓
          LangChain Layer          GitHub Integration
                 │                       │
        ┌────────┼────────┐              ↓
        ↓        ↓        ↓          Repository Data
       RAG     Tools    Memory
        │        │        │
        └────────┼────────┘
                 ↓
             Retrieval
                 │
        ┌────────┴─────────┐
        ↓                  ↓
  Vector Search       Keyword Search
        │                  │
        └────────┬─────────┘
                 ↓
              Reranker
                 ↓
          Relevant Context
                 ↓
               Gemini
                 ↓
          Structured Output
                 ↓
          Developer Response
```

---

# 🧠 AI Architecture

The AI system is divided into several components.

```text
Repository
     ↓
Ingestion
     ↓
Parsing
     ↓
Chunking
     ↓
Metadata Extraction
     ↓
Embeddings
     ↓
ChromaDB
     ↓
Retriever
     ↓
Reranker
     ↓
Context Builder
     ↓
Gemini
     ↓
Answer / Investigation / Explanation
```

---

# 📚 Knowledge Sources

The initial repository is:

```text
Grandel Hotel Booking Platform
```

The knowledge base should contain multiple source types.

---

## Source Type 1 — Source Code

Examples:

```text
frontend/
backend/
controllers/
services/
models/
routes/
middleware/
utils/
components/
```

Metadata example:

```json
{
  "source_type": "code",
  "file": "backend/controllers/bookingController.js",
  "language": "javascript",
  "module": "booking",
  "repository": "Grandel"
}
```

---

## Source Type 2 — README

Contains high-level information about:

* project purpose
* features
* architecture
* technology stack
* setup
* workflows

---

## Source Type 3 — Architecture Documentation

Example:

```text
docs/architecture/system-architecture.md
```

Contains:

* system components
* frontend/backend interaction
* services
* external integrations
* data flow

---

## Source Type 4 — Database Documentation

Example:

```text
docs/database/database-design.md
```

Contains:

* collections
* fields
* relationships
* indexes
* important constraints

---

## Source Type 5 — API Documentation

Example:

```text
docs/api/api-documentation.md
```

Contains:

```text
Endpoint
HTTP Method
Authentication
Request
Response
Errors
Purpose
```

---

## Source Type 6 — Feature Documentation

Examples:

```text
authentication.md
booking-system.md
payment-system.md
property-management.md
review-system.md
notification-system.md
qr-verification.md
ai-chatbot.md
```

---

## Source Type 7 — Testing Documentation

Contains:

* test cases
* expected behavior
* test results
* known failures
* testing strategy

---

## Source Type 8 — Troubleshooting Documentation

Contains real development problems and their resolutions.

Example:

```text
Problem
Cause
Investigation
Resolution
Affected Components
```

---

## Source Type 9 — GitHub Issues

Issues provide historical engineering knowledge.

Examples:

```text
Authentication bug
Booking bug
Payment failure
Notification failure
Performance issue
Feature request
```

---

## Source Type 10 — Pull Requests

PRs provide information about:

* changes
* reasons for changes
* affected files
* implementation decisions
* testing

---

## Source Type 11 — Git History

Commit information provides development history.

Example:

```text
Commit
 ↓
Message
 ↓
Changed Files
 ↓
Diff / Change Summary
```

---

# 📁 Recommended Knowledge Repository Structure

The Grandel repository should eventually contain:

```text
Grandel/
│
├── frontend/
│
├── backend/
│
├── docs/
│   │
│   ├── architecture/
│   │   ├── system-architecture.png
│   │   ├── system-architecture.drawio
│   │   └── architecture.md
│   │
│   ├── database/
│   │   ├── er-diagram.png
│   │   ├── er-diagram.drawio
│   │   └── database-design.md
│   │
│   ├── api/
│   │   └── api-documentation.md
│   │
│   ├── features/
│   │   ├── authentication.md
│   │   ├── booking-system.md
│   │   ├── property-management.md
│   │   ├── payment-system.md
│   │   ├── qr-verification.md
│   │   ├── notification-system.md
│   │   ├── review-system.md
│   │   └── ai-chatbot.md
│   │
│   ├── workflows/
│   │   ├── booking-flow.png
│   │   ├── payment-flow.png
│   │   └── qr-verification-flow.png
│   │
│   ├── testing/
│   │   ├── test-plan.md
│   │   ├── test-cases.md
│   │   └── test-results.md
│   │
│   ├── troubleshooting/
│   │   └── troubleshooting.md
│   │
│   └── security/
│       └── security.md
│
└── README.md
```

---

# 🔄 Repository Ingestion Pipeline

The ingestion process is:

```text
GitHub Repository
        ↓
Repository Loader
        ↓
File Discovery
        ↓
File Classification
        ↓
Content Extraction
        ↓
Code / Document Parsing
        ↓
Intelligent Chunking
        ↓
Metadata Extraction
        ↓
Embedding Generation
        ↓
ChromaDB
```

---

# 📂 File Classification

The ingestion system should classify files.

Example:

```text
.js / .jsx / .ts / .tsx / .py / .java
        ↓
CODE

.md / .txt
        ↓
DOCUMENTATION

.json / .yaml / .yml
        ↓
CONFIGURATION

.png / .jpg
        ↓
DIAGRAM / IMAGE

.gitignore
package.json
requirements.txt
        ↓
PROJECT METADATA
```

Binary files and unnecessary files should be excluded.

Exclude examples:

```text
node_modules/
.git/
dist/
build/
coverage/
.env
large binaries
temporary files
```

---

# ✂️ Intelligent Chunking

Naive chunking should be avoided when possible.

Bad:

```text
Every 500 characters
```

Better:

```text
Code
 ↓
Function / Class / Module
 ↓
Chunk
```

Documentation:

```text
Document
 ↓
Heading
 ↓
Section
 ↓
Subsection
 ↓
Chunk
```

Each chunk should retain useful metadata.

---

# 🏷️ Metadata Design

Every vector should contain metadata.

Example:

```json
{
  "repository": "Grandel",
  "source_type": "code",
  "file_path": "backend/controllers/bookingController.js",
  "language": "javascript",
  "module": "booking",
  "branch": "main"
}
```

Documentation example:

```json
{
  "repository": "Grandel",
  "source_type": "documentation",
  "file_path": "docs/features/booking-system.md",
  "section": "Booking Workflow"
}
```

GitHub issue example:

```json
{
  "repository": "Grandel",
  "source_type": "github_issue",
  "issue_number": 21,
  "status": "closed"
}
```

---

# 🔢 Embeddings

Each chunk is converted into a vector representation.

```text
Text / Code Chunk
       ↓
Embedding Model
       ↓
Vector
       ↓
ChromaDB
```

The embedding model should be configurable.

The system should not hard-code the embedding provider into every module.

---

# 🗄️ Vector Database

## ChromaDB

ChromaDB stores:

```text
Embedding
Content
Metadata
Document ID
```

Example:

```text
Document ID:
booking-controller-001

Content:
createBooking() implementation...

Metadata:
source_type = code
file = bookingController.js
module = booking
```

---

# 🔎 Retrieval Pipeline

The retrieval pipeline should be:

```text
User Query
    ↓
Query Understanding
    ↓
Query Rewriting (optional)
    ↓
Semantic Retrieval
    ↓
Keyword Retrieval
    ↓
Metadata Filtering
    ↓
Result Combination
    ↓
Reranking
    ↓
Context Selection
```

---

# 🧠 Query Understanding

Before retrieval, identify what the user is asking.

Possible intents:

```text
knowledge
code_explanation
debugging
architecture
database
api
testing
history
issue_search
code_review
```

Example:

```text
"How does booking creation work?"
```

Intent:

```text
knowledge / code_explanation
```

Example:

```text
"Why is booking returning 500?"
```

Intent:

```text
debugging
```

---

# 🤖 AI Agent

The platform should eventually use a LangChain-based agent.

The agent decides which tools are necessary.

Possible tools:

```text
Repository Search
Code Retriever
Documentation Retriever
Issue Search
Pull Request Search
Commit Search
Database Documentation Search
API Documentation Search
```

Example:

```text
Developer Query
       ↓
      Agent
       │
       ├── Search Code
       ├── Search Docs
       ├── Search Issues
       └── Search Git History
       │
       ↓
    Evidence
       ↓
     Gemini
       ↓
    Response
```

The agent should not use every tool for every query.

---

# 🛠️ Tool Design

## Repository Search Tool

Search repository code and documents.

Input:

```json
{
  "query": "authentication middleware"
}
```

Output:

```json
{
  "results": [
    {
      "file": "backend/middleware/auth.js",
      "content": "...",
      "score": 0.91
    }
  ]
}
```

---

## Issue Search Tool

Search GitHub issues.

Input:

```json
{
  "query": "booking duplicate"
}
```

Output:

```json
{
  "issues": [
    {
      "number": 34,
      "title": "Duplicate booking created",
      "status": "closed"
    }
  ]
}
```

---

## Commit Search Tool

Search development history.

Example query:

```text
"authentication changes"
```

---

# 🐛 Debugging Engine

Debugging is one of the main features.

The developer provides:

```text
Error Message
+
Endpoint
+
Expected Behavior
+
Actual Behavior
```

The system investigates the repository.

---

## Debugging Workflow

```text
Error
 ↓
Error Classification
 ↓
Query Generation
 ↓
Code Retrieval
 ↓
Documentation Retrieval
 ↓
Issue Retrieval
 ↓
Git History Retrieval
 ↓
Evidence Aggregation
 ↓
LLM Reasoning
 ↓
Root Cause Candidates
 ↓
Recommended Investigation
```

---

# 🔍 Debugging Example

Developer:

```text
POST /api/bookings is returning HTTP 500.
```

System searches:

```text
booking route
+
booking controller
+
booking service
+
booking model
+
database documentation
+
related GitHub issues
+
recent commits
```

Then produces:

```text
Possible Cause

The booking creation flow appears to fail while
validating the property reference.

Relevant Components:

1. bookingRoutes.js
2. bookingController.js
3. Booking model
4. Property model

Related Issue:

Issue #34 discusses a similar booking validation failure.

Recommended Investigation:

Verify that the property ID exists before creating
the booking document.
```

The system must distinguish:

```text
Retrieved Evidence
```

from:

```text
AI Inference
```

---

# 📖 Code Explanation Mode

A developer can ask:

```text
"Explain this function."
```

The system retrieves related code.

It should explain:

```text
Purpose
Inputs
Outputs
Dependencies
Control Flow
Database Interaction
External Services
Potential Failure Points
```

---

# 🏗️ Architecture Analysis Mode

The system can answer:

> "Explain the architecture of Grandel."

It should retrieve:

```text
Architecture documentation
+
README
+
Relevant source code
```

Then produce:

```text
Frontend
 ↓
API Layer
 ↓
Backend Services
 ↓
Database
```

with explanations grounded in repository evidence.

---

# 🗄️ Database Analysis Mode

Questions such as:

```text
"How are bookings related to properties?"
```

should retrieve:

```text
ER Diagram
+
Database Documentation
+
Models
+
Relevant Controllers
```

The LLM should combine these sources to explain the relationship.

---

# 🔌 API Analysis Mode

Questions such as:

```text
"What API creates a booking?"
```

should retrieve:

```text
Route
+
Controller
+
API Documentation
```

and provide:

```text
HTTP Method
Endpoint
Authentication
Request
Response
Implementation File
```

---

# 🕐 Development History Mode

Questions such as:

> "Why was authentication changed?"

should search:

```text
Commits
+
Pull Requests
+
Issues
+
Code
```

The system should distinguish between:

```text
Documented reason
```

and:

```text
LLM interpretation
```

---

# 💬 Conversational Memory

The platform should maintain conversation context.

Example:

```text
User:
How does authentication work?

AI:
Authentication uses ...

User:
Where is the token verified?

AI:
The token is verified in ...

User:
Why was it implemented there?

AI:
Based on the architecture...
```

The third question should understand what "there" refers to.

Memory should contain:

```text
Previous queries
Previous answers
Retrieved sources
Current topic
Current repository
```

---

# 🧩 Prompt Engineering

Prompts should be separated by task.

Recommended prompts:

```text
prompts/
├── answer_prompt.py
├── debugging_prompt.py
├── code_explanation_prompt.py
├── architecture_prompt.py
├── database_prompt.py
├── code_review_prompt.py
├── query_rewrite_prompt.py
├── agent_prompt.py
└── summarization_prompt.py
```

Avoid one giant prompt for the entire application.

---

# 📦 Structured LLM Output

LLM responses should use structured schemas wherever possible.

Example:

```json
{
  "answer": "The booking request is handled by...",
  "confidence": "high",
  "sources": [
    {
      "file": "backend/controllers/bookingController.js",
      "reason": "Contains booking creation logic"
    }
  ],
  "inference": false
}
```

For debugging:

```json
{
  "summary": "The booking request may fail during property validation.",
  "possible_causes": [
    {
      "cause": "Invalid property reference",
      "evidence": [
        "bookingController.js",
        "Booking model"
      ]
    }
  ],
  "recommended_investigation": [
    "Verify property ID exists before booking creation"
  ]
}
```

---

# 🛡️ Hallucination Prevention

The system should follow strict grounding rules.

The AI must:

* use retrieved evidence
* identify sources
* avoid inventing repository files
* avoid inventing functions
* avoid inventing issues
* avoid inventing commits
* distinguish inference from evidence
* say when insufficient information is available

Example:

```text
I could not find sufficient repository evidence
to determine the exact cause.
```

is preferable to inventing an explanation.

---

# 🔐 Security

Sensitive information must not be indexed.

Exclude:

```text
.env
API keys
passwords
tokens
private credentials
secret configuration
```

The ingestion pipeline should include an ignore mechanism.

Example:

```text
.env
.env.*
credentials.*
secrets.*
node_modules/
.git/
dist/
build/
```

---

# 📁 Project Architecture

Recommended structure:

```text
software-engineering-ai/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Repository/
│   │   │   ├── Search/
│   │   │   ├── Debugging/
│   │   │   ├── Sources/
│   │   │   └── Architecture/
│   │   │
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   ├── repository.py
│   │   │   ├── search.py
│   │   │   ├── debugging.py
│   │   │   └── github.py
│   │   │
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   │
│   │   ├── ingestion/
│   │   │   ├── repository_loader.py
│   │   │   ├── file_classifier.py
│   │   │   ├── code_parser.py
│   │   │   ├── document_parser.py
│   │   │   ├── chunker.py
│   │   │   ├── metadata.py
│   │   │   └── pipeline.py
│   │   │
│   │   ├── rag/
│   │   │   ├── embeddings.py
│   │   │   ├── vector_store.py
│   │   │   ├── retriever.py
│   │   │   ├── hybrid_search.py
│   │   │   ├── reranker.py
│   │   │   └── context_builder.py
│   │   │
│   │   ├── agents/
│   │   │   ├── engineering_agent.py
│   │   │   └── tools/
│   │   │       ├── code_search.py
│   │   │       ├── document_search.py
│   │   │       ├── issue_search.py
│   │   │       ├── pr_search.py
│   │   │       └── commit_search.py
│   │   │
│   │   ├── services/
│   │   │   ├── llm.py
│   │   │   ├── answer_service.py
│   │   │   ├── debugging_service.py
│   │   │   ├── architecture_service.py
│   │   │   └── code_explanation_service.py
│   │   │
│   │   ├── memory/
│   │   │   └── conversation_memory.py
│   │   │
│   │   ├── prompts/
│   │   │   ├── answer_prompt.py
│   │   │   ├── debugging_prompt.py
│   │   │   ├── agent_prompt.py
│   │   │   └── code_prompt.py
│   │   │
│   │   └── schemas/
│   │       ├── chat.py
│   │       ├── retrieval.py
│   │       ├── debugging.py
│   │       └── response.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── data/
│   ├── raw/
│   ├── processed/
│   └── chroma/
│
├── tests/
│   ├── test_ingestion.py
│   ├── test_chunking.py
│   ├── test_embeddings.py
│   ├── test_retrieval.py
│   ├── test_reranking.py
│   ├── test_agent.py
│   ├── test_debugging.py
│   └── test_end_to_end.py
│
├── README.md
└── .gitignore
```

---

# 🧰 Technology Stack

## Frontend

```text
React / Next.js
JavaScript / TypeScript
Tailwind CSS
```

## Backend

```text
Python
FastAPI
Pydantic
```

## LLM

```text
Google Gemini
```

## AI Framework

```text
LangChain
```

## Embeddings

Configurable embedding model.

## Vector Database

```text
ChromaDB
```

## Application Database

```text
PostgreSQL
```

## Repository Integration

```text
GitHub API
```

---

# 🔑 Environment Variables

Example:

```env
GEMINI_API_KEY=your_key

GITHUB_TOKEN=your_token

DATABASE_URL=your_database_url

CHROMA_PERSIST_DIRECTORY=./data/chroma

EMBEDDING_MODEL=your_embedding_model
```

Never commit `.env`.

---

# 🚀 Installation

## Clone the project

```bash
git clone <your-ai-platform-repository>
cd software-engineering-ai
```

---

## Backend

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Frontend

```bash
cd frontend
npm install
```

---

# ▶️ Running the Application

## Start Backend

```bash
cd backend
uvicorn app.main:app --reload
```

## Start Frontend

```bash
cd frontend
npm run dev
```

---

# 🔄 Complete Ingestion Workflow

When a repository is connected:

```text
GitHub URL
    ↓
Validate Repository
    ↓
Clone / API Access
    ↓
Discover Files
    ↓
Filter Unnecessary Files
    ↓
Classify Files
    ↓
Parse Content
    ↓
Create Documents
    ↓
Create Metadata
    ↓
Intelligent Chunking
    ↓
Generate Embeddings
    ↓
Store in ChromaDB
```

The ingestion process should produce an ingestion summary:

```json
{
  "repository": "Grandel",
  "files_processed": 142,
  "files_skipped": 38,
  "documents_created": 421,
  "embeddings_created": 421,
  "issues_indexed": 12,
  "pull_requests_indexed": 8
}
```

---

# 🔎 Complete Query Workflow

```text
Developer Question
        ↓
Conversation Context
        ↓
Intent Detection
        ↓
Query Rewriting
        ↓
Retriever Selection
        ↓
Vector Search
        ↓
Keyword Search
        ↓
Metadata Filtering
        ↓
Reranking
        ↓
Context Construction
        ↓
Gemini
        ↓
Structured Response
        ↓
Sources
        ↓
Developer
```

---

# 🐛 Complete Debugging Workflow

```text
Developer provides error
        ↓
Extract error information
        ↓
Determine likely repository concepts
        ↓
Search relevant code
        ↓
Search documentation
        ↓
Search GitHub issues
        ↓
Search recent commits
        ↓
Rank evidence
        ↓
LLM reasoning
        ↓
Possible causes
        ↓
Evidence
        ↓
Recommended investigation
```

---

# 📊 Evaluation

The system should be evaluated instead of assuming that RAG works correctly.

## Retrieval Metrics

Measure:

```text
Recall@K
Precision@K
MRR
Hit Rate
```

---

## Answer Metrics

Measure:

```text
Answer Relevance
Faithfulness
Context Relevance
Citation Accuracy
Completeness
```

---

## System Metrics

Measure:

```text
Latency
Token Usage
Retrieval Time
LLM Response Time
Number of Retrieved Chunks
```

---

# 🧪 Evaluation Dataset

Create a fixed evaluation dataset.

Example:

```json
[
  {
    "question": "How is authentication implemented?",
    "expected_sources": [
      "backend/middleware/auth.js"
    ]
  },
  {
    "question": "How are bookings stored?",
    "expected_sources": [
      "Booking model",
      "database documentation"
    ]
  }
]
```

The system can periodically run these questions to detect retrieval regressions.

---

# 🧪 Testing Strategy

## Unit Tests

Test:

```text
File classification
Code parsing
Chunking
Metadata extraction
Embedding generation
Retriever
Reranker
Prompt formatting
```

## Integration Tests

Test:

```text
Repository
 ↓
Ingestion
 ↓
ChromaDB
 ↓
Retriever
 ↓
LLM
```

## End-to-End Tests

Test:

```text
User Question
 ↓
Retrieval
 ↓
Answer
 ↓
Sources
```

---

# ⚡ Performance Considerations

The system should avoid unnecessary LLM calls.

Use deterministic logic where possible.

For example:

```text
File filtering
Metadata filtering
Duplicate detection
Time limits
Result limits
```

should not require an LLM.

Use the LLM for:

```text
Reasoning
Query understanding
Answer generation
Debugging analysis
Code explanation
Agent decisions
```

---

# 🧠 AI Engineering Principles

This project demonstrates several important AI engineering concepts.

### RAG

Repository-specific knowledge retrieval.

### Embeddings

Semantic representation of code and documents.

### Vector Search

Finding semantically similar information.

### Hybrid Retrieval

Combining semantic and lexical retrieval.

### Reranking

Improving retrieved context quality.

### Metadata Filtering

Restricting retrieval based on repository information.

### Context Engineering

Selecting the most useful information for the LLM.

### Prompt Engineering

Designing task-specific prompts.

### Structured Outputs

Making LLM responses machine-readable.

### Agents

Allowing the LLM to choose appropriate tools.

### Tool Calling

Connecting the model to repository and GitHub operations.

### Memory

Maintaining conversational context.

### Evaluation

Measuring retrieval and generation quality.

---

# 🔥 Example User Scenarios

## Scenario 1 — Repository Understanding

User:

```text
How does Grandel handle a booking?
```

System:

```text
Retrieve:
- booking documentation
- booking controller
- booking model
- booking routes
```

Then explain the workflow.

---

## Scenario 2 — Code Navigation

User:

```text
Where is booking creation implemented?
```

System returns:

```text
Relevant Files
├── bookingRoutes.js
├── bookingController.js
└── Booking.js
```

---

## Scenario 3 — Database Understanding

User:

```text
How are users, bookings and properties related?
```

System retrieves:

```text
ER Diagram
Database Documentation
User Model
Booking Model
Property Model
```

---

## Scenario 4 — Debugging

User:

```text
My booking API is returning 500.
```

System searches:

```text
Booking Route
Booking Controller
Booking Model
Database Documentation
Related Issues
Recent Commits
```

Then generates an evidence-based investigation.

---

## Scenario 5 — Development History

User:

```text
Why was the authentication middleware changed?
```

System searches:

```text
Git Commits
Pull Requests
Issues
Authentication Code
Documentation
```

---

## Scenario 6 — Architecture

User:

```text
Explain the complete architecture of the booking system.
```

System retrieves the relevant architecture and implementation information and generates a structured explanation.

---

# 🔮 Future Extensions

The architecture should allow future support for:

```text
Multiple GitHub repositories
GitLab repositories
Bitbucket repositories
Jira integration
Slack engineering discussions
Advanced code graph
Dependency graph
Repository comparison
Automated documentation generation
Automated test generation
Advanced code review
IDE integration
Voice-based developer assistant
```

These are future extensions and are not required for the initial implementation.

---

# 🛣️ Implementation Roadmap

## Phase 1 — Repository Ingestion

```text
GitHub repository
 ↓
File discovery
 ↓
Classification
 ↓
Parsing
 ↓
Chunking
 ↓
Metadata
```

---

## Phase 2 — Embeddings + ChromaDB

```text
Chunks
 ↓
Embeddings
 ↓
ChromaDB
```

---

## Phase 3 — Basic RAG

Implement:

```text
Query
 ↓
Retriever
 ↓
Context
 ↓
Gemini
 ↓
Answer
```

---

## Phase 4 — Advanced Retrieval

Add:

```text
Hybrid Search
Metadata Filtering
Reranking
Context Compression
```

---

## Phase 5 — GitHub Knowledge

Add:

```text
Issues
Pull Requests
Commits
```

---

## Phase 6 — LangChain Agent

Add:

```text
Agent
 ↓
Repository Search
 ↓
Documentation Search
 ↓
Issue Search
 ↓
PR Search
 ↓
Commit Search
```

---

## Phase 7 — Developer Intelligence Features

Implement:

```text
Code Explanation
Architecture Analysis
Database Analysis
API Analysis
Debugging
Code Review
Development History
```

---

## Phase 8 — Memory + Evaluation

Add:

```text
Conversation Memory
Evaluation Dataset
Retrieval Metrics
Answer Evaluation
Regression Testing
```

---

# 🎯 Final System

The final system should behave like an AI software engineer that has access to the project's engineering knowledge.

```text
                         DEVELOPER
                             │
                             ↓
                       AI PLATFORM
                             │
                  ┌──────────┴──────────┐
                  ↓                     ↓
             Conversation          Repository
                  │                     │
                  ↓                     ↓
              AI Agent             Knowledge Base
                  │                     │
       ┌──────────┼──────────┐          │
       ↓          ↓          ↓          ↓
     Code       Issues      Git      Documents
     Search     Search    History     + Docs
       │          │          │          │
       └──────────┼──────────┴──────────┘
                  ↓
              RAG ENGINE
                  ↓
       Retrieval + Reranking
                  ↓
               Gemini
                  ↓
          Engineering Reasoning
                  ↓
        Answer / Debug / Explain
                  ↓
              Sources
                  ↓
              DEVELOPER
```

---

# 🏆 Project Goal

The goal is **not** to build another generic chatbot.

The goal is to build a system that can:

> **Understand a real software repository, retrieve the right engineering evidence, reason over that evidence, and help developers understand and debug the system.**

The project should demonstrate that RAG and LangChain are being used because they solve real engineering problems.

The core principle is:

```text
Do not make the LLM guess.

Retrieve the repository knowledge first.
Then let the LLM reason over the evidence.
```

---

# 👨‍💻 Initial Knowledge Source

The first repository used for development and evaluation is:

```text
Grandel — Hotel Booking Platform
```

The system should initially be optimized and tested against Grandel before being generalized to arbitrary repositories.

Once the pipeline works reliably with Grandel, repository ingestion can be generalized so that another GitHub repository can be connected without changing the core RAG architecture.

---

# 📌 Development Principle

Build the project incrementally.

Do not implement every advanced feature at the beginning.

The recommended order is:

```text
Ingestion
   ↓
Chunking
   ↓
Embeddings
   ↓
ChromaDB
   ↓
Basic RAG
   ↓
Metadata
   ↓
Hybrid Retrieval
   ↓
Reranking
   ↓
GitHub Issues / PRs / Commits
   ↓
LangChain Agent
   ↓
Debugging
   ↓
Memory
   ↓
Evaluation
```

Each stage should be tested before moving to the next stage.

---

# 📄 License

This project is intended as an educational and portfolio AI engineering project.

If external repositories are indexed, their respective licenses and usage requirements must be respected.
