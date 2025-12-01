# PDI Tracker

Aplicação web para gerenciamento de Plano de Desenvolvimento Individual (PDI).

## Funcionalidades

- ✅ Adicionar novos temas de estudo com meta de horas
- ✅ Registrar horas estudadas (incrementos de 0.5h)
- ✅ Acompanhar progresso visual com barras
- ✅ Marcar temas como concluídos
- ✅ Dashboard com estatísticas gerais
- ✅ Gerar relatório em PDF
- ✅ Exportar dados em JSON
- ✅ Importar dados de backup JSON
- ✅ Armazenamento local (localStorage)

## Tecnologias

- HTML5
- CSS3 (Tailwind CSS via CDN)
- JavaScript (Vanilla)
- jsPDF (geração de PDF)

## Como usar

1. Abra o arquivo `index.html` em seu navegador
2. Adicione temas de estudo com suas metas de horas
3. Use os botões + e - para registrar horas estudadas
4. Acompanhe seu progresso no dashboard
5. Exporte seus dados regularmente como backup

## Estrutura de Arquivos

```
PDI_Project/
├── index.html      # Página principal
├── styles.css      # Estilos customizados
├── script.js       # Lógica da aplicação
└── README.md       # Documentação
```

## Armazenamento

Todos os dados são salvos localmente no navegador (localStorage). Recomenda-se fazer backups regulares usando a função "Exportar JSON".

