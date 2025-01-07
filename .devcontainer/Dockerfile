# Use the official Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Set environment variables
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
ENV DEBIAN_FRONTEND=non-interactive

# Install required packages and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        wget \
        sudo \
        git \
        build-essential \
        libssl-dev \
        zlib1g-dev \
        libbz2-dev \
        libreadline-dev \
        libsqlite3-dev \
        llvm \
        libncurses5-dev \
        libncursesw5-dev \
        xz-utils \
        tk-dev \
        libffi-dev \
        liblzma-dev \
        python3-openssl \
        openssh-client \
        apt-transport-https \
        ca-certificates \
        libcurl4-openssl-dev \
        libgnutls30 \
        make \
        gcc \
        g++ \
        libxmlsec1-dev \
        pkg-config \
        lsb-core \
        libpng-dev \
        libfreetype6-dev \
        libpq-dev \
        postgresql-client \
        python3-pip \
        # Node.js and Yarn dependencies
        gnupg2 \
        && \
    # Clean up to reduce image size
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js (LTS version) and npm
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - && \
    apt-get install -y nodejs && \
    # Verify installation
    node -v && \
    npm -v

# Install Yarn package manager
RUN npm install --global yarn && \
    # Verify installation
    yarn -v