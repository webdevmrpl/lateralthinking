FROM python:3.12.3

RUN apt update && apt install -y nano tcpdump && rm -rf /var/lib/apt /var/lib/cache/apt
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf ./aws

COPY requirements.txt .
COPY setup.sh .
RUN ./setup.sh

RUN adduser --disabled-password --gecos "" lta
RUN mkdir /imports && chown lta /imports


WORKDIR /backend

COPY . .

CMD ["bash"]