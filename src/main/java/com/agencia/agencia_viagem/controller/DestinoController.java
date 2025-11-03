package com.agencia.agencia_viagem.controller;

import com.agencia.agencia_viagem.model.Destino;
import com.agencia.agencia_viagem.service.DestinoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinos")
public class DestinoController {

    private final DestinoService destinoService;

    public DestinoController(DestinoService destinoService) {
        this.destinoService = destinoService;
    }

    @PostMapping
    public ResponseEntity<Destino> cadastrar(@RequestBody Destino destino) {
        return ResponseEntity.ok(destinoService.cadastrarDestino(destino));
    }

    @GetMapping
    public ResponseEntity<List<Destino>> listar() {
        return ResponseEntity.ok(destinoService.listarDestinos());
    }

    @GetMapping("/pesquisar")
    public ResponseEntity<List<Destino>> pesquisar(@RequestParam(required = false) String nome,
                                                   @RequestParam(required = false) String localizacao) {
        if (nome != null) return ResponseEntity.ok(destinoService.pesquisarPorNome(nome));
        if (localizacao != null) return ResponseEntity.ok(destinoService.pesquisarPorLocalizacao(localizacao));
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destino> detalhar(@PathVariable Long id) {
        return destinoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/avaliar")
    public ResponseEntity<Destino> avaliar(@PathVariable Long id, @RequestParam int nota) {
        if (nota < 1 || nota > 10) return ResponseEntity.badRequest().build();
        return ResponseEntity.ok(destinoService.avaliarDestino(id, nota));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        destinoService.excluirDestino(id);
        return ResponseEntity.noContent().build();
    }
}
