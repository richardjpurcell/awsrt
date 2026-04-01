.PHONY: backend frontend

backend:
	PYTHONPATH=backend uvicorn api.main:app --reload --port 8000

frontend:
	npm --prefix frontend run dev

