package com.agencia.agencia_viagem.service;

import com.agencia.agencia_viagem.model.Destino;
import com.agencia.agencia_viagem.repository.DestinoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DestinoService {

    private final DestinoRepository destinoRepository;

    public DestinoService(DestinoRepository destinoRepository) {
        this.destinoRepository = destinoRepository;
    }

    public Destino cadastrarDestino(Destino destino) {
        return destinoRepository.save(destino);
    }

    public List<Destino> listarDestinos() {
        return destinoRepository.findAll();
    }

    public List<Destino> pesquisarPorNome(String nome) {
        return destinoRepository.findByNomeContainingIgnoreCase(nome);
    }

    public List<Destino> pesquisarPorLocalizacao(String localizacao) {
        return destinoRepository.findByLocalizacaoContainingIgnoreCase(localizacao);
    }

    public Optional<Destino> buscarPorId(Long id) {
        return destinoRepository.findById(id);
    }

    public void excluirDestino(Long id) {
        destinoRepository.deleteById(id);
    }

    public Destino avaliarDestino(Long id, int nota) {
        Destino destino = destinoRepository.findById(id).orElseThrow();
        destino.adicionarAvaliacao(nota);
        return destinoRepository.save(destino);
    }
}
