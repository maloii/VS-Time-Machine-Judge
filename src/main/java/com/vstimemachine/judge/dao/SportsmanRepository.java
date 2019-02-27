package com.vstimemachine.judge.dao;

import com.vstimemachine.judge.model.Competition;
import com.vstimemachine.judge.model.Round;
import com.vstimemachine.judge.model.Sportsman;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Transactional
public interface SportsmanRepository extends CrudRepository<Sportsman, Long> {

    @Override
    Sportsman save(@Param("sportsman") Sportsman gate);

    Optional<Sportsman> findByTranspondersNumberAndCompetition(Integer number, Competition competition);

    @Override
    void deleteById(@Param("id") Long id);

    @Override
    void delete(@Param("sportsman") Sportsman gate);

    @Query("select s from Sportsman s where s.competition=?1 and s.selected=true order by RAND()")
    public List<Sportsman> findAllRandamQuestions(@Param("competition") Competition competition);
}
