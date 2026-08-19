# EchoRAG — one-command reproducible build.
PY := .venv/bin/python
PIP := .venv/bin/pip
LANG ?= hin
QUERIES ?= 3000
BENCH_QUERIES ?= 300

.PHONY: help setup data index bench calibrate test api dev build clean all

help:
	@echo "make all        - setup, fetch data, build indexes, benchmark"
	@echo "make setup      - create venv, install python + node deps"
	@echo "make data       - download MSMARCO-XI split and build the corpus"
	@echo "make index      - build one hybrid index per chunking strategy"
	@echo "make bench      - measure P50/P70/P100 + Recall@k"
	@echo "make calibrate  - re-derive the abstention threshold"
	@echo "make test       - run the test suite"
	@echo "make api / dev  - run backend / frontend"

setup:
	python3 -m venv .venv
	$(PIP) install -q -r requirements.txt
	npm install

data:
	$(PY) -m ingestion.fetch_dataset --lang $(LANG)
	$(PY) -m ingestion.build_corpus --parquet ingestion/data/$(LANG)val.parquet --queries $(QUERIES)

index:
	$(PY) -m ingestion.build_index

bench:
	$(PY) -m benchmarks.harness --queries $(BENCH_QUERIES)

calibrate:
	$(PY) -m benchmarks.calibrate

test:
	$(PY) -m unittest discover -s tests -v

api:
	.venv/bin/uvicorn backend.api.server:app --reload --port 8000

dev:
	npm run dev

build:
	npm run build

clean:
	rm -rf ingestion/indexes dist __pycache__ */__pycache__ */*/__pycache__

all: setup data index calibrate bench
