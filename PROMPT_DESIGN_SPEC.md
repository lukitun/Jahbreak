# Jahbreak Prompt Engineering Design Specification

## Overview
Jahbreak will implement three distinct prompt engineering techniques, each optimized for different learning and interaction styles.

## Three Techniques

### 1. Direct/1-Shot Technique
**Purpose**: Comprehensive, immediate guidance for task completion
**Characteristics**:
- Complete, detailed instructions
- Step-by-step guidance
- Examples and best practices
- Common pitfalls and solutions
- Ready-to-execute format

**Template Structure**:
```
[ROLE DEFINITION with expertise level and background]

OBJECTIVE: [Clear statement of what will be accomplished]

APPROACH:
[Detailed methodology and framework]

STEP-BY-STEP EXECUTION:
1. [Detailed first step with examples]
2. [Detailed second step with examples]
...

BEST PRACTICES:
- [Specific, actionable advice]
- [Industry standards and conventions]

COMMON PITFALLS TO AVOID:
- [Specific mistakes and how to prevent them]

QUALITY CRITERIA:
- [How to evaluate success]
- [Metrics and benchmarks]

NEXT STEPS:
- [What to do after completion]
- [How to iterate and improve]
```

### 2. Interactive/2-Shot Technique
**Purpose**: Dialogue-driven guidance with clarification
**Characteristics**:
- Starts with strategic questions
- Encourages clarification and discussion
- Adaptive guidance based on responses
- Collaborative problem-solving approach

**Template Structure**:
```
[ROLE DEFINITION with collaborative expertise]

DISCOVERY PHASE:
Before I provide detailed guidance, I need to understand your specific context:

ESSENTIAL QUESTIONS:
1. [Strategic question about scope/requirements]
2. [Question about constraints/limitations]
3. [Question about experience level/background]
4. [Question about desired outcomes]

BASED ON YOUR RESPONSES, I WILL:
- [What will be customized based on answers]
- [How the guidance will be tailored]

COLLABORATION FRAMEWORK:
- [How the interaction will proceed]
- [What kind of feedback is needed]

EXPECTED OUTCOME:
[What the collaborative process will achieve]
```

### 3. Socratic Technique
**Purpose**: Learning through guided self-discovery
**Characteristics**:
- Strategic questioning to guide thinking
- Leads to self-discovery of solutions
- Builds deep understanding
- Develops critical thinking skills

**Template Structure**:
```
[ROLE DEFINITION as a questioning guide/mentor]

SOCRATIC EXPLORATION:
Instead of giving you direct answers, I'll guide you to discover the solution through strategic questions.

GUIDING QUESTIONS:
1. [Question that makes them analyze the problem]
2. [Question that explores underlying assumptions]
3. [Question that considers multiple approaches]
4. [Question that evaluates pros and cons]
5. [Question that connects to broader principles]

THINKING FRAMEWORK:
- [How to approach the thinking process]
- [What to consider at each step]

DISCOVERY PATH:
- [How questions will build upon each other]
- [What insights should emerge]

SELF-EVALUATION:
- [Questions to validate their own thinking]
- [How to test their conclusions]
```

## Implementation Examples

### Example Query: "How do I learn machine learning?"

#### Direct/1-Shot Response:
```
You are a Senior Machine Learning Engineer with 8+ years of experience in both academia and industry, having built production ML systems and taught thousands of students.

OBJECTIVE: Create a comprehensive, structured learning path for machine learning that takes you from beginner to job-ready practitioner in 6-12 months.

APPROACH:
Use a project-driven learning methodology combined with theoretical foundations, focusing on practical skills that employers value while building a strong conceptual understanding.

STEP-BY-STEP EXECUTION:
1. FOUNDATION PHASE (4-6 weeks)
   - Complete Khan Academy's Linear Algebra and Statistics courses
   - Learn Python programming: variables, functions, data structures, pandas, numpy
   - Practice with 50+ coding exercises on HackerRank/LeetCode easy problems
   - Project: Build a simple data analysis dashboard using Python and pandas

2. CORE ML CONCEPTS (6-8 weeks)
   - Take Andrew Ng's Machine Learning Course (Coursera)
   - Read "Hands-On Machine Learning" by Aurélien Géron (first 10 chapters)
   - Implement algorithms from scratch: linear regression, logistic regression, decision trees
   - Project: Predict house prices using multiple regression techniques

3. PRACTICAL ML TOOLS (4-6 weeks)
   - Master scikit-learn library through official tutorials
   - Learn data preprocessing, feature engineering, model selection
   - Understand cross-validation, hyperparameter tuning, ensemble methods
   - Project: End-to-end ML pipeline for customer churn prediction

4. DEEP LEARNING FUNDAMENTALS (6-8 weeks)
   - Complete Fast.ai's "Practical Deep Learning" course
   - Learn TensorFlow/Keras through official tutorials
   - Understand neural networks, CNNs, RNNs, transfer learning
   - Project: Image classification system using CNNs

5. SPECIALIZATION & PORTFOLIO (8-10 weeks)
   - Choose specialization: NLP, Computer Vision, or Time Series
   - Complete 3-4 significant projects in your chosen area
   - Deploy models using Flask/FastAPI and cloud platforms
   - Project: Deploy a full-stack ML application

BEST PRACTICES:
- Code daily, even if just 30 minutes
- Join ML communities (Kaggle, Reddit r/MachineLearning)
- Document everything in a public GitHub repository
- Write blog posts explaining your projects and learnings
- Practice explaining concepts simply (Feynman Technique)
- Focus on understanding, not just implementation

COMMON PITFALLS TO AVOID:
- Jumping to deep learning without understanding basics
- Only following tutorials without building original projects
- Ignoring data preprocessing and exploratory data analysis
- Not learning proper software engineering practices
- Studying in isolation without community engagement
- Focusing only on accuracy without considering business impact

QUALITY CRITERIA:
- Can explain ML concepts to non-technical stakeholders
- Built and deployed at least 3 end-to-end ML projects
- Understands when to use different algorithms
- Can debug and improve model performance systematically
- Demonstrates good software engineering practices

NEXT STEPS:
- Apply to ML internships or entry-level positions
- Contribute to open-source ML projects
- Participate in Kaggle competitions
- Consider advanced specializations or certifications
- Build a network through conferences and meetups
```

#### Interactive/2-Shot Response:
```
You are an experienced Machine Learning Mentor who specializes in creating personalized learning journeys based on individual backgrounds, goals, and constraints.

DISCOVERY PHASE:
Before I create your personalized machine learning roadmap, I need to understand your unique situation:

ESSENTIAL QUESTIONS:
1. What's your current background? (programming experience, math/statistics knowledge, education level)
2. What's driving your interest in ML? (career change, skill enhancement, specific problem to solve, academic interest)
3. How much time can you realistically dedicate? (hours per week, timeline flexibility, other commitments)
4. What's your preferred learning style? (hands-on projects, theoretical study, video courses, reading, mentorship)
5. What are your career goals? (specific roles, industries, company types, freelancing vs employment)
6. What resources do you have access to? (budget for courses, hardware for training models, internet speed)

BASED ON YOUR RESPONSES, I WILL:
- Customize the learning sequence to match your background
- Recommend specific resources that fit your learning style and budget
- Adjust the timeline to be realistic for your schedule
- Focus on skills most relevant to your career goals
- Suggest appropriate difficulty progression
- Identify potential challenges and mitigation strategies

COLLABORATION FRAMEWORK:
- We'll create checkpoints every 2-3 weeks to assess progress
- I'll help you troubleshoot specific challenges as they arise
- We can adjust the plan based on what's working and what isn't
- I'll connect you with relevant communities and mentors
- We'll practice interview skills and portfolio review when ready

EXPECTED OUTCOME:
A personalized, adaptive learning plan that maximizes your chances of success while fitting your lifestyle and goals.
```

#### Socratic Response:
```
You are a Socratic Learning Guide who helps people discover their own learning path through strategic questioning and self-reflection.

SOCRATIC EXPLORATION:
Rather than giving you a prescribed learning path, let's explore together what approach would work best for you through guided questions.

GUIDING QUESTIONS:
1. What does "learning machine learning" mean to you specifically? What would you want to be able to do that you can't do now?

2. Think about times you've successfully learned complex skills before. What conditions and approaches led to your success?

3. When you imagine yourself using machine learning, what problems are you solving? Who benefits from your work?

4. What aspects of learning tend to be challenging for you? How have you overcome learning obstacles in the past?

5. If you had to explain to someone why machine learning is important, what would you say? What draws you to this field?

6. What would "good enough" look like for your ML skills? How would you know you've achieved your learning goals?

7. What resources (time, money, support) do you realistically have available? What constraints do you need to work within?

THINKING FRAMEWORK:
- Consider each question deeply before moving to the next
- Notice what excites you and what feels overwhelming
- Pay attention to patterns in your responses
- Think about both the destination and the journey

DISCOVERY PATH:
- Your answers will reveal your learning style preferences
- We'll uncover your intrinsic motivations and external goals
- You'll identify your unique constraints and advantages
- We'll discover what success means specifically to you

SELF-EVALUATION:
- After answering these questions, what learning approach feels most natural?
- What would be the most sustainable way for you to make progress?
- How can you design a learning experience that builds on your strengths?
- What would make this journey enjoyable rather than just difficult?
```

## Technical Implementation Notes

### Backend Changes Needed:
1. Completely rewrite prompt generation functions
2. Add sophisticated templates for each technique
3. Implement context-aware prompt customization
4. Add support for role-specific expertise and examples

### Frontend Changes Needed:
1. Add UI for selecting between three techniques
2. Update display components for different prompt types
3. Add styling for different prompt categories
4. Implement proper responsive design for longer content

### Quality Standards:
- Each prompt should be 800-2000+ characters
- Include specific, actionable content
- Provide real examples and concrete steps
- Address common challenges and solutions
- Demonstrate expertise and authority