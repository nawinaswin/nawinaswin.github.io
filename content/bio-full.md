---
title: "Full bio"
date: 2026-08-31
layout: "bio-full"
description: "Nawin Sakthivelan is a machine learning engineer based in San Francisco, working on model alignment, efficient inference, and production ML systems."
---

I'm **Nawin Sakthivelan**, a machine learning engineer based in San Francisco, California. My work spans large language model alignment, efficient training and inference, recommendation systems, and the infrastructure that brings machine learning into production.

I've worked across applied ML research, production engineering, and financial analytics at IBM, Gilbarco Veeder Root, and Standard Chartered. This blog is where I share research notes, projects, and technical writing about machine learning and systems engineering.

## Experience

### Applied ML Research Engineer · IBM

**February 2025 – July 2026 · New York City, NY**

At IBM, I worked on model alignment, reward modeling, and real-time speech recognition.

- Formulated RLHF and direct preference optimization (DPO) strategies for 70B-parameter models using FP8 quantization and custom Triton kernels, reducing GPU memory usage by 45% and annual infrastructure costs by $1.2 million while maintaining policy performance.
- Designed reward modeling and alignment verification pipelines to measure policy drift and hallucinations, detecting degradation within five minutes to trigger continuous preference evaluation.
- Fine-tuned and deployed Whisper-based speech recognition models, with custom inference logic and stream-processing pipelines that reduced audio feature update latency from 24 hours to under two seconds.
- Evaluated emerging open-weight foundation models and custom reward functions against domain-specific preference benchmarks.

### Machine Learning Engineer · Gilbarco Veeder Root

**June 2022 – January 2025 · Simsbury, CT**

My work focused on recommendation systems, distributed training, feature infrastructure, and efficient edge inference.

- Designed and scaled a two-stage recommendation engine using retrieval and ranking in PyTorch, processing more than 850 million items for 45 million monthly active users and increasing conversion by 18%.
- Distributed model training across 128 NVIDIA H100 GPUs using PyTorch FSDP and DeepSpeed, reducing iteration time from 14 days to 36 hours.
- Built an automated feature store with Feast and Redis to unify online and offline feature access and eliminate training-serving skew across 12 production ML models.
- Integrated INT8 and INT4 quantization for edge computer vision models, achieving 3.8× higher throughput with TensorRT while keeping the drop in mAP below 0.5%.

### Data Analyst · Standard Chartered

**January 2019 – August 2021 · Bengaluru, India**

I analyzed financial and customer datasets to identify trends, anomalies, and performance drivers for business and risk teams. Using Python, SQL, statistical analysis, and predictive modeling, I automated data pipelines and dashboards and assessed customer behavior, portfolio performance, and financial metrics. I also partnered with business, risk, and technology teams to define requirements, validate data quality, and improve reporting and monitoring.

## Education

**Master of Science in Machine Learning**

Stevens Institute of Technology, New Jersey · 2021–2022

Specialization in Analytics and Finance.

## Technical skills

- **Languages:** Python, C/C++, SQL, CUDA, Go, Rust.
- **Machine learning and deep learning:** PyTorch, JAX, TensorFlow, TensorRT, vLLM, Hugging Face, DeepSpeed.
- **Infrastructure and MLOps:** Kubernetes, Docker, Ray, MLflow, Triton Inference Server, Apache Spark, Kafka, AWS (SageMaker, EKS, S3), and Google Cloud Platform (BigQuery, GKE, Vertex AI/Gemini).
- **Systems and engineering:** Distributed systems, model quantization, CI/CD, asynchronous programming, REST, and gRPC.

## Get in touch

You can reach me at [nawinaswins@gmail.com](mailto:nawinaswins@gmail.com), find my code on [GitHub](https://github.com/nawinaswin), or connect on [LinkedIn](https://www.linkedin.com/in/nawinsakthivelan/).
