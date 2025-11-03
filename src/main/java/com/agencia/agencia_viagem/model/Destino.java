package com.agencia.agencia_viagem.model;

import jakarta.persistence.*;

@Entity
public class Destino {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String localizacao;
    private String descricao;
    private double precoPacote;
    private double avaliacaoMedia = 0.0;
    private int totalAvaliacoes = 0;

    public Destino() {}

    public Destino(String nome, String localizacao, String descricao, double precoPacote) {
        this.nome = nome;
        this.localizacao = localizacao;
        this.descricao = descricao;
        this.precoPacote = precoPacote;
    }

    public Long getId() { return id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getLocalizacao() { return localizacao; }
    public void setLocalizacao(String localizacao) { this.localizacao = localizacao; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public double getPrecoPacote() { return precoPacote; }
    public void setPrecoPacote(double precoPacote) { this.precoPacote = precoPacote; }

    public double getAvaliacaoMedia() { return avaliacaoMedia; }
    public int getTotalAvaliacoes() { return totalAvaliacoes; }

    public void adicionarAvaliacao(int nota) {
        double total = this.avaliacaoMedia * this.totalAvaliacoes;
        this.totalAvaliacoes++;
        this.avaliacaoMedia = (total + nota) / this.totalAvaliacoes;
    }
}
