class PDITracker {
    constructor() {
        this.temas = this.carregarDados();
        this.temasSelecionados = new Set();
        this.modoSelecao = false;
        const savedDarkMode = localStorage.getItem('pdiDarkMode');
        this.darkMode = savedDarkMode === null ? true : savedDarkMode === 'true';
        this.init();
    }

    init() {
        this.aplicarDarkMode();
        this.renderizarTemas();
        this.atualizarEstatisticas();
        this.configurarEventos();
        this.updateLanguageUI();
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        localStorage.setItem('pdiDarkMode', this.darkMode);
        this.aplicarDarkMode();
    }

    aplicarDarkMode() {
        if (this.darkMode) {
            document.documentElement.classList.add('dark');
            document.querySelector('.dark-mode-icon-light')?.classList.add('hidden');
            document.querySelector('.dark-mode-icon-dark')?.classList.remove('hidden');
            localStorage.setItem('pdiDarkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            document.querySelector('.dark-mode-icon-light')?.classList.remove('hidden');
            document.querySelector('.dark-mode-icon-dark')?.classList.add('hidden');
            localStorage.setItem('pdiDarkMode', 'false');
        }
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 100);
        }
    }

    carregarDados() {
        const dados = localStorage.getItem('pdiTemas');
        return dados ? JSON.parse(dados) : [];
    }

    salvarDados() {
        localStorage.setItem('pdiTemas', JSON.stringify(this.temas));
    }

    configurarEventos() {
        document.getElementById('formNovoTema').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarTema();
        });

        document.getElementById('btnRelatorio').addEventListener('click', () => {
            this.gerarRelatorioPDF();
        });

        document.getElementById('btnExportar').addEventListener('click', () => {
            this.exportarJSON();
        });

        document.getElementById('btnImportar').addEventListener('click', () => {
            document.getElementById('inputArquivo').click();
        });

        document.getElementById('inputArquivo').addEventListener('change', (e) => {
            this.importarJSON(e);
        });
    }

    formatarTitleCase(texto) {
        return texto
            .toLowerCase()
            .split(' ')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    }

    adicionarTema() {
        const nomeOriginal = document.getElementById('inputNomeTema').value.trim();
        const horasMeta = parseInt(document.getElementById('inputHorasMeta').value);

        if (!nomeOriginal || !horasMeta || horasMeta <= 0) {
            this.mostrarToast(i18n.t('pleaseFillAllFields'), 'error');
            return;
        }

        const nome = this.formatarTitleCase(nomeOriginal);

        const novoTema = {
            id: Date.now(),
            nome,
            horasMeta,
            horasEstudadas: 0,
            concluido: false,
            dataCriacao: new Date().toISOString()
        };

        this.temas.push(novoTema);
        this.salvarDados();
        this.renderizarTemas();
        this.atualizarEstatisticas();

        document.getElementById('formNovoTema').reset();
        
        this.mostrarToast(i18n.formatMessage('themeAddedSuccess', { theme: nome }), 'info');
    }

    removerTema(id) {
        if (confirm(i18n.t('confirmDeleteTheme'))) {
            this.temas = this.temas.filter(tema => tema.id !== id);
            this.salvarDados();
            this.renderizarTemas();
            this.atualizarEstatisticas();
        }
    }

    toggleModoSelecao() {
        this.modoSelecao = !this.modoSelecao;
        if (!this.modoSelecao) {
            this.temasSelecionados.clear();
        }
        
        const barraSelecao = document.getElementById('barraSelecao');
        const btnModoSelecao = document.getElementById('btnModoSelecao');
        
        if (barraSelecao) {
            if (this.modoSelecao) {
                barraSelecao.classList.remove('hidden');
                if (btnModoSelecao) btnModoSelecao.classList.add('hidden');
            } else {
                barraSelecao.classList.add('hidden');
                if (btnModoSelecao) btnModoSelecao.classList.remove('hidden');
            }
        }
        
        this.renderizarTemas();
        this.atualizarBotaoSelecao();
    }

    toggleSelecaoTema(id) {
        if (this.temasSelecionados.has(id)) {
            this.temasSelecionados.delete(id);
        } else {
            this.temasSelecionados.add(id);
        }
        this.atualizarBotaoSelecao();
    }

    selecionarTodos() {
        if (this.temasSelecionados.size === this.temas.length) {
            this.temasSelecionados.clear();
        } else {
            this.temas.forEach(tema => this.temasSelecionados.add(tema.id));
        }
        this.renderizarTemas();
        this.atualizarBotaoSelecao();
    }

    deletarSelecionados() {
        if (this.temasSelecionados.size === 0) return;
        
        const quantidade = this.temasSelecionados.size;
        if (confirm(i18n.formatMessage('confirmDeleteMultiple', { count: quantidade }))) {
            this.temas = this.temas.filter(tema => !this.temasSelecionados.has(tema.id));
            this.temasSelecionados.clear();
            this.modoSelecao = false;
            this.salvarDados();
            this.renderizarTemas();
            this.atualizarEstatisticas();
            this.atualizarBotaoSelecao();
        }
    }

    atualizarBotaoSelecao() {
        const btnDeletar = document.getElementById('btnDeletarSelecionados');
        const btnSelecionarTodos = document.getElementById('btnSelecionarTodos');
        const contadorSelecao = document.getElementById('contadorSelecao');
        
        if (btnDeletar && contadorSelecao) {
            if (this.temasSelecionados.size > 0) {
                btnDeletar.classList.remove('hidden');
                contadorSelecao.textContent = `${this.temasSelecionados.size} ${i18n.t('selected')}`;
            } else {
                btnDeletar.classList.add('hidden');
                contadorSelecao.textContent = '';
            }
        }

        if (btnSelecionarTodos) {
            const textoBtn = this.temasSelecionados.size === this.temas.length ? i18n.t('deselectAll') : i18n.t('selectAll');
            btnSelecionarTodos.querySelector('span').textContent = textoBtn;
        }
    }

    adicionarHoras(id, horas) {
        const tema = this.temas.find(t => t.id === id);
        if (tema) {
            const eraIncompleto = !tema.concluido;
            tema.horasEstudadas = Math.min(tema.horasEstudadas + horas, tema.horasMeta);
            if (tema.horasEstudadas >= tema.horasMeta) {
                tema.concluido = true;
                if (eraIncompleto) {
                    this.mostrarParabens(tema.nome);
                }
            }
            this.salvarDados();
            this.renderizarTemas();
            this.atualizarEstatisticas();
        }
    }

    mostrarInputHoras(id) {
        const inputContainer = document.getElementById(`input-horas-${id}`);
        const botoesAcao = document.getElementById(`botoes-acao-${id}`);
        
        if (inputContainer && botoesAcao) {
            inputContainer.classList.remove('hidden');
            botoesAcao.classList.add('hidden');
        }
    }

    adicionarHorasRapido(id, horas) {
        this.adicionarHoras(id, horas);
        this.cancelarInputHoras(id);
    }

    cancelarInputHoras(id) {
        const inputContainer = document.getElementById(`input-horas-${id}`);
        const botoesAcao = document.getElementById(`botoes-acao-${id}`);
        const input = document.getElementById(`input-valor-${id}`);
        
        if (inputContainer && botoesAcao) {
            inputContainer.classList.add('hidden');
            botoesAcao.classList.remove('hidden');
            if (input) {
                input.value = '';
            }
        }
    }

    confirmarInputHoras(id) {
        const input = document.getElementById(`input-valor-${id}`);
        if (!input || !input.value.trim()) {
            this.mostrarToast(i18n.t('pleaseEnterHours'), 'error');
            return;
        }

        const horas = parseFloat(input.value);
        if (isNaN(horas) || horas <= 0) {
            this.mostrarToast(i18n.t('pleaseEnterValidNumber'), 'error');
            return;
        }

        this.adicionarHoras(id, horas);
        this.cancelarInputHoras(id);
    }

    removerHoras(id, horas) {
        const tema = this.temas.find(t => t.id === id);
        if (tema) {
            tema.horasEstudadas = Math.max(tema.horasEstudadas - horas, 0);
            tema.concluido = false;
            this.salvarDados();
            this.renderizarTemas();
            this.atualizarEstatisticas();
        }
    }

    marcarConcluido(id) {
        const tema = this.temas.find(t => t.id === id);
        if (tema) {
            const eraIncompleto = !tema.concluido;
            tema.concluido = !tema.concluido;
            if (tema.concluido) {
                tema.horasEstudadas = tema.horasMeta;
                if (eraIncompleto) {
                    this.mostrarParabens(tema.nome);
                }
            }
            this.salvarDados();
            this.renderizarTemas();
            this.atualizarEstatisticas();
        }
    }

    mostrarParabens(nomeTema) {
        const mensagens = [
            i18n.formatMessage('congratulations1', { theme: nomeTema }),
            i18n.formatMessage('congratulations2', { theme: nomeTema }),
            i18n.formatMessage('congratulations3', { theme: nomeTema }),
            i18n.formatMessage('congratulations4', { theme: nomeTema }),
            i18n.formatMessage('congratulations5', { theme: nomeTema })
        ];
        
        const mensagem = mensagens[Math.floor(Math.random() * mensagens.length)];
        this.mostrarToast(mensagem, 'success');
    }

    renderizarTemas() {
        const container = document.getElementById('listaTemas');
        const btnModoSelecao = document.getElementById('btnModoSelecao');
        
        if (this.temas.length === 0) {
            if (btnModoSelecao) btnModoSelecao.classList.add('hidden');
            container.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
                    <div class="flex justify-center mb-3">
                        <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <i data-lucide="book-open" class="w-6 h-6 text-gray-400 dark:text-gray-500"></i>
                        </div>
                    </div>
                    <h3 class="text-base font-semibold text-gray-600 dark:text-gray-300 mb-1">${i18n.t('noThemesTitle')}</h3>
                    <p class="text-sm text-gray-400 dark:text-gray-500">${i18n.t('noThemesDescription')}</p>
                </div>
            `;
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            return;
        }
        
        if (btnModoSelecao && !this.modoSelecao) {
            btnModoSelecao.classList.remove('hidden');
        }

        const html = this.temas.map(tema => {
            const progresso = (tema.horasEstudadas / tema.horasMeta) * 100;
            const statusClass = tema.concluido ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600';
            const statusText = tema.concluido ? i18n.t('statusCompleted') : i18n.t('statusInProgress');
            const selecionado = this.temasSelecionados.has(tema.id);
            
            return `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm fade-in ${this.modoSelecao ? 'ring-2 ring-offset-2 ' + (selecionado ? 'ring-purple-500' : 'ring-transparent') : ''}">
                    <div class="flex items-start justify-between mb-4">
                        ${this.modoSelecao ? `
                            <div class="flex items-start gap-3 flex-1">
                                <input 
                                    type="checkbox" 
                                    ${selecionado ? 'checked' : ''}
                                    onchange="app.toggleSelecaoTema(${tema.id})"
                                    class="w-5 h-5 mt-1 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 cursor-pointer"
                                >
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-2">
                                        <h3 class="text-xl font-bold text-gray-800 dark:text-white">${tema.nome}</h3>
                                        <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                                            ${statusText}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span>${tema.horasEstudadas}h / ${tema.horasMeta}h</span>
                                        <span class="text-gray-300 dark:text-gray-600">•</span>
                                        <span>${progresso.toFixed(1)}%</span>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">${tema.nome}</h3>
                                    <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                                        ${statusText}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>${tema.horasEstudadas}h / ${tema.horasMeta}h</span>
                                    <span class="text-gray-300 dark:text-gray-600">•</span>
                                    <span>${progresso.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 ml-4">
                                <div id="botoes-acao-${tema.id}" class="flex items-center gap-1.5">
                                    <button onclick="app.removerHoras(${tema.id}, 0.5)" class="w-8 h-8 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition" title="${i18n.t('remove05h')}">
                                        <i data-lucide="minus" class="w-4 h-4 text-gray-600 dark:text-gray-300"></i>
                                    </button>
                                    <button onclick="app.adicionarHoras(${tema.id}, 0.5)" class="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg flex items-center justify-center transition" title="${i18n.t('add05h')}">
                                        <i data-lucide="plus" class="w-4 h-4 text-purple-600 dark:text-purple-400"></i>
                                    </button>
                                    <button onclick="app.mostrarInputHoras(${tema.id})" class="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg flex items-center justify-center transition" title="${i18n.t('addHours')}">
                                        <i data-lucide="clock" class="w-4 h-4 text-blue-600 dark:text-blue-400"></i>
                                    </button>
                                    <button onclick="app.marcarConcluido(${tema.id})" class="w-8 h-8 ${tema.concluido ? 'bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'} rounded-lg flex items-center justify-center transition" title="${i18n.t('markAsCompleted')}">
                                        <i data-lucide="check" class="w-4 h-4 ${tema.concluido ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}"></i>
                                    </button>
                                    <button onclick="app.removerTema(${tema.id})" class="w-8 h-8 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg flex items-center justify-center transition" title="${i18n.t('removeTheme')}">
                                        <i data-lucide="trash-2" class="w-4 h-4 text-red-600 dark:text-red-400"></i>
                                    </button>
                                </div>
                            </div>
                        `}
                    </div>
                    
                    ${!this.modoSelecao ? `
                        <div id="input-horas-${tema.id}" class="hidden mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                            <div class="flex flex-wrap items-center gap-2">
                                <button onclick="app.adicionarHorasRapido(${tema.id}, 0.5)" class="px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-md border border-blue-200 dark:border-blue-800 transition">
                                    ${i18n.t('min30')}
                                </button>
                                <button onclick="app.adicionarHorasRapido(${tema.id}, 1)" class="px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-md border border-blue-200 dark:border-blue-800 transition">
                                    ${i18n.t('min60')}
                                </button>
                                <button onclick="app.adicionarHorasRapido(${tema.id}, 2)" class="px-3 py-1.5 bg-white dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-gray-600 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-md border border-blue-200 dark:border-blue-800 transition">
                                    ${i18n.t('min120')}
                                </button>
                                <div class="flex items-center gap-2 ml-auto">
                                    <input 
                                        type="number" 
                                        id="input-valor-${tema.id}" 
                                        placeholder="${i18n.t('customHours')}" 
                                        min="0.1" 
                                        step="0.5"
                                        class="w-28 px-3 py-1.5 border border-blue-200 dark:border-blue-800 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        onkeypress="if(event.key === 'Enter') app.confirmarInputHoras(${tema.id})"
                                    >
                                    <button onclick="app.confirmarInputHoras(${tema.id})" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition">
                                        ${i18n.t('okButton')}
                                    </button>
                                    <button onclick="app.cancelarInputHoras(${tema.id})" class="w-8 h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md flex items-center justify-center transition" title="${i18n.t('cancelButton')}">
                                        <i data-lucide="x" class="w-4 h-4 text-gray-600 dark:text-gray-300"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div class="progress-bar ${tema.concluido ? 'bg-green-500' : 'bg-purple-600'} h-full rounded-full" style="width: ${progresso}%"></div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html.join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    atualizarEstatisticas() {
        const totalEstudado = this.temas.reduce((total, tema) => total + tema.horasEstudadas, 0);
        const totalMeta = this.temas.reduce((total, tema) => total + tema.horasMeta, 0);
        const emAndamento = this.temas.filter(tema => !tema.concluido).length;
        const concluidos = this.temas.filter(tema => tema.concluido).length;

        document.getElementById('totalEstudado').textContent = `${totalEstudado}h`;
        document.getElementById('emAndamento').textContent = emAndamento;
        document.getElementById('concluidos').textContent = concluidos;

        const horasRealizadas = document.getElementById('horasRealizadas');
        const horasMeta = document.getElementById('horasMeta');
        const progressoPercentual = document.getElementById('progressoPercentual');
        const progressCircle = document.getElementById('progressCircle');

        if (horasRealizadas && horasMeta && progressoPercentual && progressCircle) {
            horasRealizadas.textContent = totalEstudado;
            horasMeta.textContent = totalMeta;

            const percentual = totalMeta > 0 ? (totalEstudado / totalMeta) * 100 : 0;
            progressoPercentual.textContent = `${Math.min(percentual, 100).toFixed(0)}%`;

            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (percentual / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    gerarRelatorioPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const locale = i18n.getCurrentLanguage() === 'pt' ? 'pt-BR' : 'en-US';
        
        doc.setFontSize(20);
        doc.text(i18n.t('pdfReportTitle'), 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`${i18n.t('pdfDate')}: ${new Date().toLocaleDateString(locale)}`, 105, 30, { align: 'center' });
        
        const totalEstudado = this.temas.reduce((total, tema) => total + tema.horasEstudadas, 0);
        const emAndamento = this.temas.filter(tema => !tema.concluido).length;
        const concluidos = this.temas.filter(tema => tema.concluido).length;
        
        doc.setFontSize(14);
        doc.text(i18n.t('pdfGeneralStats'), 20, 45);
        doc.setFontSize(11);
        doc.text(`${i18n.t('pdfTotalHours')}: ${totalEstudado}h`, 20, 55);
        doc.text(`${i18n.t('pdfThemesInProgress')}: ${emAndamento}`, 20, 62);
        doc.text(`${i18n.t('pdfThemesCompleted')}: ${concluidos}`, 20, 69);
        
        doc.setFontSize(14);
        doc.text(`${i18n.t('pdfThemes')}`, 20, 85);
        
        let y = 95;
        doc.setFontSize(10);
        
        this.temas.forEach((tema, index) => {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            const progresso = ((tema.horasEstudadas / tema.horasMeta) * 100).toFixed(1);
            const status = tema.concluido ? i18n.t('statusCompleted') : i18n.t('statusInProgress');
            
            doc.setFont(undefined, 'bold');
            doc.text(`${index + 1}. ${tema.nome}`, 20, y);
            doc.setFont(undefined, 'normal');
            doc.text(`   ${i18n.t('pdfStatus')}: ${status}`, 20, y + 6);
            doc.text(`   ${i18n.t('pdfProgress')}: ${tema.horasEstudadas}h / ${tema.horasMeta}h (${progresso}%)`, 20, y + 12);
            
            y += 22;
        });
        
        doc.save(`relatorio-pdi-${new Date().toISOString().split('T')[0]}.pdf`);
        
        this.mostrarToast(i18n.t('pdfSuccess'), 'info');
    }

    exportarJSON() {
        const dados = {
            exportadoEm: new Date().toISOString(),
            versao: '1.0',
            temas: this.temas
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pdi-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.mostrarToast(i18n.t('exportSuccess'), 'info');
    }

    importarJSON(event) {
        const arquivo = event.target.files[0];
        if (!arquivo) return;

        const leitor = new FileReader();
        leitor.onload = (e) => {
            try {
                const dados = JSON.parse(e.target.result);
                
                if (!dados.temas || !Array.isArray(dados.temas)) {
                    throw new Error(i18n.t('invalidFileFormat'));
                }
                
                if (this.temas.length > 0) {
                    if (!confirm(i18n.t('confirmReplaceData'))) {
                        return;
                    }
                }
                
                this.temas = dados.temas;
                this.salvarDados();
                this.renderizarTemas();
                this.atualizarEstatisticas();
                
                this.mostrarToast(i18n.t('dataImportedSuccess'), 'success');
            } catch (erro) {
                this.mostrarToast(i18n.t('invalidFileFormat'), 'error');
                console.error(erro);
            }
        };
        
        leitor.readAsText(arquivo);
        event.target.value = '';
    }

    mostrarToast(mensagem, tipo = 'info') {
        const estilos = {
            success: {
                background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                icon: ""
            },
            error: {
                background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                icon: ""
            },
            info: {
                background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                icon: ""
            }
        };

        const estilo = estilos[tipo] || estilos.info;

        Toastify({
            text: `${estilo.icon}${mensagem}`,
            duration: tipo === 'error' ? 5000 : 3500,
            close: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: {
                background: estilo.background,
                borderRadius: "12px",
                padding: "16px 20px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 10px 25px rgba(124, 58, 237, 0.3)",
                color: "#ffffff"
            }
        }).showToast();
    }

    changeLanguage(lang) {
        i18n.setLanguage(lang);
        this.updateLanguageUI();
        this.renderizarTemas();
    }

    updateLanguageUI() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = i18n.t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = i18n.t(key);
        });

        const btnLangPT = document.getElementById('btnLangPT');
        const btnLangEN = document.getElementById('btnLangEN');
        
        if (btnLangPT && btnLangEN) {
            if (i18n.getCurrentLanguage() === 'pt') {
                btnLangPT.classList.add('bg-purple-100', 'dark:bg-purple-900/50', 'ring-2', 'ring-purple-500');
                btnLangEN.classList.remove('bg-purple-100', 'dark:bg-purple-900/50', 'ring-2', 'ring-purple-500');
            } else {
                btnLangEN.classList.add('bg-purple-100', 'dark:bg-purple-900/50', 'ring-2', 'ring-purple-500');
                btnLangPT.classList.remove('bg-purple-100', 'dark:bg-purple-900/50', 'ring-2', 'ring-purple-500');
            }
        }

        const btnSelecionarTodos = document.getElementById('btnSelecionarTodos');
        if (btnSelecionarTodos) {
            const textoBtn = this.temasSelecionados.size === this.temas.length ? i18n.t('deselectAll') : i18n.t('selectAll');
            btnSelecionarTodos.querySelector('span').textContent = textoBtn;
        }
        
        if (typeof lucide !== 'undefined') {
            setTimeout(() => lucide.createIcons(), 50);
        }
    }
}

const app = new PDITracker();

