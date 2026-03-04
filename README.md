# Language Tutor 🎓

Um app de aprendizado de idiomas para falantes de português brasileiro — aprenda **espanhol** e **russo** com IA e repetição espaçada científica.

## Funcionalidades

- **Repetição Espaçada (FSRS)** — algoritmo cientificamente superior ao SM-2, usado pelo Anki moderno
- **IA Conversacional** — prática de conversa com Claude (Anthropic), adaptado para falantes de português
- **Conteúdo Personalizado** — falsos cognatos PT→ES, alfabeto cirílico com guia fonético, casos russos explicados em português
- **PWA Mobile** — instale direto do navegador, funciona offline
- **Baralhos Built-in** — 50+ cartas de espanhol e 60+ cartas de russo já incluídas

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python + FastAPI |
| Banco de dados | SQLite + SQLAlchemy |
| Frontend | React 18 + TypeScript + Vite |
| Estilização | TailwindCSS |
| Mobile | PWA (Progressive Web App) |
| IA | Claude API (claude-haiku-4-5-20251001) |
| SRS | Algoritmo FSRS-5 |

## Configuração

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
cp .env.example .env
# Edite .env e adicione sua ANTHROPIC_API_KEY
python main.py
```

O backend estará disponível em `http://localhost:8000`
- Documentação da API: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

### Variáveis de Ambiente

Crie `backend/.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=sqlite:///./tutor.db
```

## Como Usar

1. **Estudar** — Vá para "Estudar" para revisar cartas com repetição espaçada
   - Toque na carta para revelar a tradução
   - Avalie: De Novo / Difícil / Bom / Fácil
   - O FSRS agenda a próxima revisão automaticamente

2. **Conversar** — Pratique com o tutor de IA
   - Escolha um tópico (livre, restaurante, viagem...)
   - Escreva em espanhol ou russo
   - O tutor corrige erros e explica em português

3. **Lições** — Gramática estruturada
   - Falsos cognatos PT→ES, alfabeto cirílico, ser vs. estar, casos russos...

4. **Progresso** — Acompanhe sua evolução com streak e heatmap

## Instalar como App Mobile

No celular, acesse `http://SEU_IP:5173` e:
- **Android (Chrome)**: Menu → "Adicionar à tela inicial"
- **iPhone (Safari)**: Compartilhar → "Adicionar à Tela de Início"
