# Use the official Ubuntu 22.04 as the base image
FROM ubuntu:22.04

# Set environment variables
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
ENV DEBIAN_FRONTEND=non-interactive
ENV PATH /root/.pyenv/shims:/root/.pyenv/bin:$PATH

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
        gnupg2 \
        && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install pyenv and Python
RUN curl https://pyenv.run | bash \
    && pyenv install 3.12.3 \
    && pyenv global 3.12.3

# Add pyenv init to shell startup script
RUN echo 'eval "$(pyenv init --path)"' >> ~/.bashrc && \
    echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc && \
    echo 'eval "$(pyenv init -)"' >> ~/.bashrc

# Install Node.js (v20) + Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    node -v && \
    npm -v && \
    npm install --global yarn && \
    yarn -v

# Add the MongoDB GPG key (server 7.0) and jammy repo
RUN curl -fsSL https://pgp.mongodb.com/server-7.0.asc \
    | gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" \
    | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB tools and mongosh
RUN apt-get update && \
    apt-get install -y mongodb-mongosh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify mongosh installation
RUN mongosh --version

CMD ["/bin/bash"]