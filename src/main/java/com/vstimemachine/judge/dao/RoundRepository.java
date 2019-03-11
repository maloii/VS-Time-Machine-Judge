package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Round;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public interface RoundRepository extends CrudRepository<Round, Long> {
    @Override
    Round save(@Param("round") Round round);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("round") Round round);


    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE round  SET selected=false WHERE competition_id=?1", nativeQuery = true)
    void clearAllSelected(Long competitionId);

}
