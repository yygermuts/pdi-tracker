const translations = {
  pt: {
    appTitle: "PDI Tracker",
    appSubtitle: "Plano de Desenvolvimento Individual",
    totalStudied: "Total Estudado",
    inProgress: "Em Andamento",
    completed: "Concluídos",
    reportPDF: "Relatório PDF",
    exportPlan: "Exportar Plano",
    importPlan: "Importar Plano",
    newTheme: "Novo Tema",
    themeName: "Nome do tema (ex: JavaScript)",
    hoursGoal: "horas de meta",
    addButton: "Adicionar",
    myThemes: "Meus Temas",
    selectButton: "Selecionar",
    selectAll: "Selecionar Todos",
    deselectAll: "Desmarcar Todos",
    deleteSelected: "Deletar Selecionados",
    cancelButton: "Cancelar",
    noThemesTitle: "Nenhum tema adicionado",
    noThemesDescription: "Adicione um novo tema acima para começar seu PDI",
    statusCompleted: "Concluído",
    statusInProgress: "Em andamento",
    remove05h: "Remover 0.5h",
    add05h: "Adicionar 0.5h",
    addHours: "Adicionar horas",
    markAsCompleted: "Marcar como concluído",
    removeTheme: "Remover tema",
    customHours: "Customizado",
    okButton: "OK",
    min30: "30min",
    min60: "60min",
    min120: "120min",
    selected: "selecionado(s)",
    confirmDeleteTheme: "Tem certeza que deseja remover este tema?",
    confirmDeleteMultiple:
      "Tem certeza que deseja remover {count} tema(s) selecionado(s)?",
    pleaseEnterHours: "Por favor, digite a quantidade de horas.",
    pleaseEnterValidNumber:
      "Por favor, digite um número válido maior que zero.",
    pleaseFillAllFields: "Por favor, preencha todos os campos corretamente.",
    congratulations1: '🎉 Parabéns! Você concluiu "{theme}"!',
    congratulations2: '🌟 Incrível! "{theme}" está completo!',
    congratulations3: '🚀 Excelente trabalho! Você finalizou "{theme}"!',
    congratulations4: '🏆 Mandou bem! "{theme}" foi concluído com sucesso!',
    congratulations5: '✨ Muito bem! Você completou "{theme}"!',
    dataImportedSuccess: "Dados importados com sucesso!",
    invalidFileFormat:
      "Erro ao importar arquivo. Verifique se o formato está correto.",
    confirmReplaceData:
      "Isso irá substituir todos os dados atuais. Deseja continuar?",
    pdfReportTitle: "Relatório PDI Tracker",
    pdfDate: "Data",
    pdfGeneralStats: "Estatísticas Gerais:",
    pdfTotalHours: "Total de horas estudadas",
    pdfThemesInProgress: "Temas em andamento",
    pdfThemesCompleted: "Temas concluídos",
    pdfThemes: "Temas:",
    pdfStatus: "Status",
    pdfProgress: "Progresso",
    overallProgress: "Progresso Geral",
    themeAddedSuccess: '✅ "{theme}" adicionado com sucesso!',
    exportSuccess: "📥 Backup exportado com sucesso!",
    pdfSuccess: "📄 Relatório gerado com sucesso!",
  },
  en: {
    appTitle: "PDI Tracker",
    appSubtitle: "Individual Development Plan",
    totalStudied: "Total Studied",
    inProgress: "In Progress",
    completed: "Completed",
    reportPDF: "PDF Report",
    exportPlan: "Export Plan",
    importPlan: "Import Plan",
    newTheme: "New Theme",
    themeName: "Theme name (e.g.: JavaScript)",
    hoursGoal: "hours goal",
    addButton: "Add",
    myThemes: "My Themes",
    selectButton: "Select",
    selectAll: "Select All",
    deselectAll: "Deselect All",
    deleteSelected: "Delete Selected",
    cancelButton: "Cancel",
    noThemesTitle: "No themes added",
    noThemesDescription: "Add a new theme above to start your PDI",
    statusCompleted: "Completed",
    statusInProgress: "In progress",
    remove05h: "Remove 0.5h",
    add05h: "Add 0.5h",
    addHours: "Add hours",
    markAsCompleted: "Mark as completed",
    removeTheme: "Remove theme",
    customHours: "Custom",
    okButton: "OK",
    min30: "30min",
    min60: "60min",
    min120: "120min",
    selected: "selected",
    confirmDeleteTheme: "Are you sure you want to remove this theme?",
    confirmDeleteMultiple:
      "Are you sure you want to remove {count} selected theme(s)?",
    pleaseEnterHours: "Please enter the number of hours.",
    pleaseEnterValidNumber: "Please enter a valid number greater than zero.",
    pleaseFillAllFields: "Please fill in all fields correctly.",
    congratulations1: '🎉 Congratulations! You completed "{theme}"!',
    congratulations2: '🌟 Amazing! "{theme}" is complete!',
    congratulations3: '🚀 Excellent work! You finished "{theme}"!',
    congratulations4: '🏆 Well done! "{theme}" was successfully completed!',
    congratulations5: '✨ Very good! You completed "{theme}"!',
    dataImportedSuccess: "Data imported successfully!",
    invalidFileFormat:
      "Error importing file. Please check if the format is correct.",
    confirmReplaceData:
      "This will replace all current data. Do you want to continue?",
    pdfReportTitle: "PDI Tracker Report",
    pdfDate: "Date",
    pdfGeneralStats: "General Statistics:",
    pdfTotalHours: "Total hours studied",
    pdfThemesInProgress: "Themes in progress",
    pdfThemesCompleted: "Themes completed",
    pdfThemes: "Themes:",
    pdfStatus: "Status",
    pdfProgress: "Progress",
    overallProgress: "Overall Progress",
    themeAddedSuccess: '✅ "{theme}" added successfully!',
    exportSuccess: "📥 Backup exported successfully!",
    pdfSuccess: "📄 Report generated successfully!",
  },
};

class I18n {
  constructor() {
    this.currentLang = localStorage.getItem("pdiLanguage") || "pt";
  }

  t(key) {
    return translations[this.currentLang][key] || key;
  }

  setLanguage(lang) {
    if (translations[lang]) {
      this.currentLang = lang;
      localStorage.setItem("pdiLanguage", lang);
      return true;
    }
    return false;
  }

  getCurrentLanguage() {
    return this.currentLang;
  }

  formatMessage(key, params) {
    let message = this.t(key);
    Object.keys(params).forEach((param) => {
      message = message.replace(`{${param}}`, params[param]);
    });
    return message;
  }
}

const i18n = new I18n();
