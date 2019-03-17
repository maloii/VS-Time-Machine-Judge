package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Group;
import com.vstimemachine.judge.model.Lap;
import com.vstimemachine.judge.model.Sportsman;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Set;

@Transactional
public interface LapRepository  extends CrudRepository<Lap, Long> {

    @Override
    Lap save(@Param("lap") Lap lap);

    @Override
    void deleteById(@Param("id") Long id);

    List<Lap> findByGroupSportsmanId(@Param("id") Long id);

    @Override
    void delete(@Param("lap") Lap lap);

    void deleteAllByGroupId(@Param("group") Long croupId);
}