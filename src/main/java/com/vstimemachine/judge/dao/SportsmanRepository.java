package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Sportsman;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;

@Transactional
public interface SportsmanRepository extends CrudRepository<Sportsman, Long> {

    @Override
    Sportsman save(@Param("sportsman") Sportsman gate);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("sportsman") Sportsman gate);
}
