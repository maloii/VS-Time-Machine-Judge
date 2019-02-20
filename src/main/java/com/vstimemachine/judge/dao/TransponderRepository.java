package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Transponder;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface TransponderRepository  extends CrudRepository<Transponder, Long> {

    @Override
    Transponder save(@Param("transponder") Transponder transponder);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("transponder") Transponder gate);
}